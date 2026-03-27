int CheckDistance(){
  long duration;
  int distance;

  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH);
  distance = duration * 0.034 / 2;
  return distance;
}

int CheckDistance2(){
  long duration;
  int distance;

  digitalWrite(TRIG2, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG2, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG2, LOW);

  duration = pulseIn(ECHO2, HIGH);
  distance = duration * 0.034 / 2;
  return distance;
}
