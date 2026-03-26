#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

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
const char* topic_publish = "esp32/has_taken_pill";

// Create instances
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

long previous_time = 0;
const long publish_interval = 1000;

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
}

void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();

  long now = millis();
  if (now - previous_time >= publish_interval) {
    previous_time = now;
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["pill_taken"] = true;

    char buffer[256];
    serializeJson(jsonDoc, buffer);

    Serial.print("Publishing JSON: ");
    Serial.println(buffer);

    mqttClient.publish(topic_publish, buffer);
  }
}