
EatTime eatTime;

uint8_t dayOfWeek(int year, uint8_t month, uint8_t day) {
    if (month < 3) {
        month += 12;
        year--;
    }
    uint8_t K = year % 100;
    uint8_t J = year / 100;

    return (day + 13*(month+1)/5 + K + K/4 + J/4 + 5*J) % 7;
}

void waitTakePills(){
  uint8_t Distance[4];
  for(int i = 0; i < 4; i++){
    Distance[i] = CheckDistance();
  }
  uint8_t avg_distance = (Distance[0] + Distance[1] + Distance[2] + Distance[3]) / 4;
  unsigned long lastTime = 0;

  while(avg_distance > 6){
    unsigned long currTime = millis();
    bool sent = false;
    if(currTime - lastTime >= 20000 && !sent){
      Serial.write("yb");
      Serial.write('-');
      Serial.write('1');
      sent = true;

    }
    for(int i = 0; i < 4; i++){
      Distance[i] = CheckDistance();
    }
    avg_distance = (Distance[0] + Distance[1] + Distance[2] + Distance[3]) / 4;
    Serial.write("yb");
    Serial.write('+');
    Serial.write('1');
    delay(60);
  }


}
