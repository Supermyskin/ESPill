#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

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

// Create instances
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

EatTime* pill_schedule = new EatTime[schedule_maxSize];
unsigned int sc_len = 0;
bool is_configurated = false;
bool is_box_open = false;
bool has_taken_pills = false;

long previous_time = 0;
const long publish_interval = 1000;
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
byte* temp = nullptr;
void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  // if (is_configurated) {
  // }
callback("woow", "{\"schedule\": [{ \"d\": 1, \"h\": 8, \"m\": 30, \"b\": 1 },{ \"d\": 1, \"h\": 12, \"m\": 0, \"b\": 3 },{ \"d\": 2, \"h\": 18, \"m\": 45, \"b\": 2 }]}", 118);
  mqttClient.loop();
}