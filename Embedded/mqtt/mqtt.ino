#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include "HeaderFile.h"
#include "Types.h"
#include "RTClib.h"
#include "Box.h"

uint8_t lastMinute = 255;
uint8_t lastPrintedMinute = 255;

const int schedule_maxSize = 500;

const char* ssid = "donottouchthis";
const char* password = "1735fc12";

const char* mqtt_broker = "507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "ESPill";
const char* mqtt_password = "1Qazxsw23edcvfr4";

const char* clientId = "ESP32Pill";

const char* topic_hasnt_taken_pill = "esp32/hasnt_taken_pill";
const char* topic_esp32 = "esp32/receive";

const char* code = "!qaz@wsx#$%^Y&U*";

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

EatTime* pill_schedule = new EatTime[schedule_maxSize]{};
unsigned int schedule_len = 0;
unsigned int curr_eatTime = 0;

Box BoxArray[] = {
  Box(S1_PIN),
  Box(S2_PIN),
  Box(S3_PIN),
  Box(S4_PIN),
  Box(S5_PIN),
  Box(S6_PIN)
};

DS1302 rtc(CLOCK_RST, CLOCK_CLK, CLOCK_DATA);

void callback(char* topic, byte* payload, unsigned int length) {

  Serial.println("\n[DEBUG MQTT] Message received");

  Serial.print("[DEBUG MQTT] Topic: ");
  Serial.println(topic);

  Serial.print("[DEBUG MQTT] Payload: ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  fillSchedule(pill_schedule, schedule_maxSize, schedule_len, payload, length);

  DateTime now = rtc.now();
  uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());
  dow += 5;
  dow %= 7;
  int i;
  for (i = 0; i < schedule_len; i++) {
    uint8_t curr_dow = (pill_schedule[i].day + 5) % 7;
    if (curr_dow > dow) {
      curr_eatTime = i;
      break;
    } else if (curr_dow == dow) {
      if (pill_schedule[i].hour > now.hour()) {
        curr_eatTime = i;
        break;
      } else if (pill_schedule[i].hour == now.hour()) {
        if (pill_schedule[i].minute > now.minute()) {
          curr_eatTime = i;
          break;
        }
      }
    }
  }
  if (i == schedule_len) curr_eatTime = 0;

  Serial.print("[DEBUG MQTT] schedule_len = ");
  Serial.println(schedule_len);
}

void reconnect() {

  Serial.println("[DEBUG MQTT] Reconnecting...");

  while (!mqttClient.connected()) {

    Serial.println("[DEBUG MQTT] Trying to connect...");

    if (mqttClient.connect(clientId, mqtt_username, mqtt_password)) {

      Serial.println("[DEBUG MQTT] Connected!");
      mqttClient.subscribe(topic_esp32);
      Serial.println("[DEBUG MQTT] Subscribed to topic");

    } else {

      Serial.print("[DEBUG MQTT] Failed, rc=");
      Serial.println(mqttClient.state());

      delay(5000);
    }
  }
}

void setup() {

  Serial.begin(115200);
  delay(2000);

  rtc.begin();

  pinMode(IR_R, INPUT);
  pinMode(IR_T1, OUTPUT);
  pinMode(IR_T2, OUTPUT);
  pinMode(BUZZ, OUTPUT);

  for (int i = 0; i < BOX_COUNT; i++) {
    BoxArray[i].init();
    delay(100);
  }

  Serial.println("[DEBUG] Booting ESP32...");
  Serial.println("[DEBUG] Connecting WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[DEBUG] WiFi connected");

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  setenv("TZ", "EET-2EEST,M3.5.0/3,M10.5.0/4", 1);
  tzset();

  struct tm timeinfo = {};

  Serial.println("Getting NTP time...");
  delay(1000);

  bool gotTime = false;
  unsigned long start = millis();

  while (millis() - start < 8000) {
    if (getLocalTime(&timeinfo)) {
      gotTime = true;
      break;
    }
    delay(500);
  }

  if (gotTime && timeinfo.tm_year > 100) {
    rtc.adjust(DateTime(
      timeinfo.tm_year + 1900,
      timeinfo.tm_mon + 1,
      timeinfo.tm_mday,
      timeinfo.tm_hour,
      timeinfo.tm_min,
      timeinfo.tm_sec));
  } else {
    Serial.println("[WARN] NTP failed -> RTC not updated");
  }

  wifiClient.setInsecure();

  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);
}

void loop() {

  if (!mqttClient.connected()) {
    reconnect();
  }

  mqttClient.loop();

  DateTime now = rtc.now();
  uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());

  if (now.minute() != lastPrintedMinute) {
    Serial.printf("TIME: day: %d, hour: %d, minute: %d\n",
                  dow, now.hour(), now.minute());
    Serial.printf("CURRENT SCHEDULE INDEX: %d\n", curr_eatTime);
    Serial.printf("NEXT PILL: day: %d, hour: %d, minute: %d\n",
                  pill_schedule[curr_eatTime].day,
                  pill_schedule[curr_eatTime].hour,
                  pill_schedule[curr_eatTime].minute);
    Serial.printf("BOXES TO OPEN: %d\n",
                  pill_schedule[curr_eatTime].boxes);

    lastPrintedMinute = now.minute();
  }

  if (pill_schedule[curr_eatTime].day == dow && pill_schedule[curr_eatTime].hour == now.hour() && pill_schedule[curr_eatTime].minute == now.minute() && now.minute() != lastMinute) {

    Serial.println("[LOGIC] !!! TRIGGERED !!!");

    lastMinute = now.minute();

    for (int i = 0; i < BOX_COUNT; i++) {
      if (pill_schedule[curr_eatTime].boxes & (1 << i)) {

        Serial.print("[BOX] OPEN ");
        Serial.println(i);

        BoxArray[i].open();
        delay(20);

        waitTakePills();

        BoxArray[i].close();

        Serial.print("[BOX] CLOSE ");
        Serial.println(i);
      }
    }

    mqttClient.publish(topic_hasnt_taken_pill, code);

    curr_eatTime++;

    if (curr_eatTime >= schedule_len) {
      curr_eatTime = 0;
    }
  }

  delay(10);
}