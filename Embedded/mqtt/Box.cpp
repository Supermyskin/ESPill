#include <ESP32Servo.h>
#include "HeaderFile.h"
class Box {
public:
  uint8_t SERVO;
  uint8_t LED;

  Servo myServo;

  Box(uint8_t servoPin, uint8_t ledPin) {
    SERVO = servoPin;
    LED = ledPin;
  }

  void init() {
    pinMode(LED, OUTPUT);

    myServo.setPeriodHertz(50);

    myServo.attach(SERVO, 500, 2500);

    myServo.write(0);
  }

  void open() {
    digitalWrite(BUZZ, HIGH);
    digitalWrite(LED, HIGH);
    myServo.write(90);
  }

  void close() {
    digitalWrite(BUZZ, LOW);
    digitalWrite(LED, LOW);
    myServo.write(0);
  }
};