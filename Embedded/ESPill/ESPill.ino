#include "HeaderFile.h"

void setup(){
  Serial.begin(9600);
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
}




void loop(){
  Serial.println("Distance: ");
  Serial.print(CheckDistance());

  delay(100);
}