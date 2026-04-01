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

void callback(char* topic, byte* payload, unsigned int length) {

  Serial.println("\n[DEBUG MQTT] Message received");

  Serial.print("[DEBUG MQTT] Topic: ");
  Serial.println(topic);

  Serial.print("[DEBUG MQTT] Payload: ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  fillSchedule(pill_schedule, schedule_maxSize, sc_len, payload, length);

  Serial.print("[DEBUG MQTT] sc_len = ");
  Serial.println(sc_len);
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
  Serial2.begin(115200, SERIAL_8N1, RX, TX);

  Serial.println("[DEBUG] Booting ESP32...");
  Serial.println("[DEBUG] Connecting WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[DEBUG] WiFi connected");

  wifiClient.setInsecure();

  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);
}

void loop() {

  if (!mqttClient.connected()) {
    reconnect();
  }

  mqttClient.loop();

  if (Serial2.available() >= 2) {

    char c = Serial2.read();

    Serial.print("[DEBUG SERIAL] First byte: ");
    Serial.println(c);

    if (c == 'y') {

      c = Serial2.read();

      Serial.print("[DEBUG SERIAL] Second byte: ");
      Serial.println(c);

      if (c == 'b') {

        long timeout = millis();

        while (Serial2.available() < 2) {
          if (millis() - timeout > 10) {
            Serial.println("[DEBUG SERIAL] Timeout waiting for data!");
            return;
          }
        }

        char buffer[2];
        Serial2.readBytes(buffer, 2);

        Serial.print("[DEBUG SERIAL] Buffer received: ");
        Serial.print(buffer[0]);
        Serial.println(buffer[1]);

        if (buffer[1] == '1') {

          if (buffer[0] == '+') {

            Serial.println("[DEBUG SERIAL] Pill TAKEN -> MQTT publish");

            mqttClient.publish(topic_has_taken_pill, code);

          } else if (buffer[0] == '-') {

            Serial.println("[DEBUG SERIAL] Pill NOT TAKEN -> MQTT publish");

            mqttClient.publish(topic_hasnt_taken_pill, code);
          }

          else if (buffer[0] == '0') {

            Serial.println("[DEBUG SERIAL] Arduino requested schedule");

            if (sc_len == 0) {
              Serial.println("[DEBUG ERROR] sc_len = 0 (no schedule)");
              return;
            }

            curr_eatTime++;

            if (curr_eatTime >= sc_len) {
              curr_eatTime = 0;
              Serial.println("[DEBUG SERIAL] Reset curr_eatTime to 0");
            }

            Serial.print("[DEBUG SERIAL] Sending schedule index: ");
            Serial.println(curr_eatTime);

            Serial2.print("yb");
            Serial2.write(pill_schedule[curr_eatTime].day);
            Serial2.write(pill_schedule[curr_eatTime].hour);
            Serial2.write(pill_schedule[curr_eatTime].minute);
            Serial2.write(pill_schedule[curr_eatTime].boxes);

            uint8_t checksum =
              pill_schedule[curr_eatTime].day ^
              pill_schedule[curr_eatTime].hour ^
              pill_schedule[curr_eatTime].minute ^
              pill_schedule[curr_eatTime].boxes;

            Serial.print("[DEBUG SERIAL] Checksum: ");
            Serial.println(checksum);

            Serial2.write(checksum);
          }
        }
      }
    }
  }

  delay(10);
}