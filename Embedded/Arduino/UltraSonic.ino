#include "HeaderFile.h"

int CheckDistance(){
  long duration;
  int distance;
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH, 3000);
  if(duration == 0){
    distance = 40;
  }
  else{
    distance = duration * 0.034 / 2;
  }
  return distance;
}

