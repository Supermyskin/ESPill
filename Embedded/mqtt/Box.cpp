#include "Box.h"

Box::Box(uint8_t servoPin) {
  SERVO = servoPin;
}

void Box::init() {

  myServo.setPeriodHertz(50);
  myServo.attach(SERVO, 500, 2500);

  myServo.write(0);
}

void Box::open() {
  digitalWrite(BUZZ, HIGH);
  myServo.write(90);
}

void Box::close() {
  digitalWrite(BUZZ, LOW);
  myServo.write(0);
}