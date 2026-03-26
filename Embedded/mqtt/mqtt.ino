#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "HeaderFile.h"

const int schedule_maxSize = 1000;

// Wi-Fi credentials
const char* ssid = "donottouchthis";
const char* password = "1735fc12";

// MQTT broker details
const char* mqtt_broker = "507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "ESPill";
const char* mqtt_password = "1Qazxsw23edcvfr4";

// Fixed MQTT client ID
const char* clientId = "ESP32_Pill";

// MQTT topic
const char* topic_has_taken_pill = "esp32/has_taken_pill";
const char* topic_hasnt_taken_pill = "esp32/hasnt_taken_pill";
const char* topic_esp32 = "esp32/receive";
const char* code = "!qaz@wsx#$%^Y&U*";

// Create instances
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

EatTime* pill_schedule = new EatTime[schedule_maxSize];
unsigned int sc_len = 0;
unsigned int curr_eatTime = 0;
long previous_time = 0;
void callback(char* topic, byte* payload, unsigned int length) {
  fillSchedule(pill_schedule, schedule_maxSize, sc_len, payload, length);
}
void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
    Serial.println("Reconnecting to MQTT Broker...");
    if (mqttClient.connect(clientId, mqtt_username, mqtt_password)) {
      Serial.println("Connected to MQTT Broker.");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, RX, TX);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected to Wi-Fi");

  wifiClient.setInsecure();
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();
  if(Serial2.available() >= 2){
    char c = Serial2.read();
    if(c == 'Y'){
      c = Serial2.read();
      if(c == 'B'){
        long timeout = millis();
        while(Serial2.available() < 2){
          if(millis() - timeout > 10){
            return;
          }
        }
        char buffer[2];
        Serial2.readBytes(buffer, 2);
        if(buffer[1] == '1'){
          if(buffer[0] == '+'){
            mqttClient.publish(topic_has_taken_pill, code);
          }
          else if(buffer[0] == '-'){
            mqttClient.publish(topic_hasnt_taken_pill, code);
          }
          else if(buffer[0] == '0'){
            curr_eatTime++;
            if(curr_eatTime >= schedule_maxSize) curr_eatTime = 0;
            Serial2.print("YB");
            Serial2.write(pill_schedule[curr_eatTime].day);
            Serial2.write(pill_schedule[curr_eatTime].hour);
            Serial2.write(pill_schedule[curr_eatTime].minute);
            Serial2.write(pill_schedule[curr_eatTime].boxes);            
          }
        }
      }
    }
  }
}