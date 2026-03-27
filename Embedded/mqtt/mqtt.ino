#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "HeaderFile.h"

const int schedule_maxSize = 1000;

const char* ssid = "donottouchthis";
const char* password = "1735fc12";

const char* mqtt_broker = "507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "ESPill";
const char* mqtt_password = "1Qazxsw23edcvfr4";

const char* clientId = "ESP32Pill";

const char* topic_has_taken_pill = "esp32/has_taken_pill";
const char* topic_hasnt_taken_pill = "esp32/hasnt_taken_pill";
const char* topic_esp32 = "esp32/receive";

const char* code = "!qaz@wsx#$%^Y&U*";

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

EatTime* pill_schedule = new EatTime[schedule_maxSize];
unsigned int sc_len = 0;
unsigned int curr_eatTime = 0;

long previous_time = 0;

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("\n=== MQTT CALLBACK ===");
  Serial.print("Topic: ");
  Serial.println(topic);

  Serial.print("Length: ");
  Serial.println(length);

  Serial.print("Payload: ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }

  fillSchedule(pill_schedule, schedule_maxSize, sc_len, payload, length);

  Serial.print("sc_len after fill: ");
  Serial.println(sc_len);
}

// ================= RECONNECT =================
void reconnect() {
  Serial.println("MQTT reconnect...");

  while (!mqttClient.connected()) {
    Serial.println("Trying to connect...");

    if (mqttClient.connect(clientId, mqtt_username, mqtt_password)) {
      Serial.println("Connected!");

      mqttClient.subscribe(topic_esp32);
      Serial.println("Subscribed OK");

    } else {
      Serial.print("Fail, rc=");
      Serial.println(mqttClient.state());
      delay(5000);
    }
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, RX, TX);

  Serial.println("Connecting WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");

  wifiClient.setInsecure();

  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);
}

// ================= LOOP =================
void loop() {

  if (!mqttClient.connected()) {
    reconnect();
  }

  mqttClient.loop();

  if (Serial2.available() >= 2) {
    char c = Serial2.read();

    if (c == 'y') {
      c = Serial2.read();
      
      if (c == 'b') {

        long timeout = millis();
        while (Serial2.available() < 2) {
          if (millis() - timeout > 10) {
            Serial.println("Serial timeout!");
            return;
          }
        }

        char buffer[2];
        Serial2.readBytes(buffer, 2);

        Serial.print("Serial2 buffer: ");
        Serial.print(buffer[0]);
        Serial.println(buffer[1]);

        if (buffer[1] == '1') {

          if (buffer[0] == '+') {
            Serial.println("Publish TAKEN");
            mqttClient.publish(topic_has_taken_pill, code);
          }
          else if (buffer[0] == '-') {
            Serial.println("Publish NOT TAKEN");
            mqttClient.publish(topic_hasnt_taken_pill, code);
          }
          else if (buffer[0] == '0') {

            curr_eatTime++;

            if (curr_eatTime >= sc_len) curr_eatTime = 0;

            Serial.println("Sending schedule item");

            Serial2.print("yb");
            Serial2.write(pill_schedule[curr_eatTime].day);
            Serial2.write(pill_schedule[curr_eatTime].hour);
            Serial2.write(pill_schedule[curr_eatTime].minute);
            Serial2.write(pill_schedule[curr_eatTime].boxes);
            Serial2.write(pill_schedule[curr_eatTime].day
                        ^ pill_schedule[curr_eatTime].hour 
                        ^ pill_schedule[curr_eatTime].minute
                        ^ pill_schedule[curr_eatTime].boxes);
          }
        }
      }
    }
  }
  delay(1000);
}