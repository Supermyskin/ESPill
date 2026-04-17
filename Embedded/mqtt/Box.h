#pragma once

#include <Arduino.h>
#include <ESP32Servo.h>
#include "HeaderFile.h"

class Box {
public:
  uint8_t SERVO;
  uint8_t LED;

  Servo myServo;

  Box(uint8_t servoPin, uint8_t ledPin);

  void init();
  void open();
  void close();
};