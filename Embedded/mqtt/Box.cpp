#include "Box.h"

Box::Box(uint8_t servoPin) {
  SERVO = servoPin;
}

void Box::init() {
  myServo.setPeriodHertz(50);
  myServo.attach(SERVO, 500, 2500);
    myServo.write(0);
    delay(20);
}

void Box::open() {
  for (int pos = 0; pos <= 90; pos++) {
    myServo.write(pos);
    delay(20);
  }
  digitalWrite(BUZZ, HIGH);
}

void Box::close() {
  digitalWrite(BUZZ, LOW);
  for (int pos = 90; pos >= 0; pos--) {
    myServo.write(pos);
    delay(20);
  }
}