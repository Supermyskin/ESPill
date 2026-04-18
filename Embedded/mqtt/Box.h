#pragma once

#include <Arduino.h>
#include <ESP32Servo.h>
#include "HeaderFile.h"

class Box {
public:
  uint8_t SERVO;

  Servo myServo;

  Box(uint8_t servoPin);

  void init();
  void open();
  void close();
};