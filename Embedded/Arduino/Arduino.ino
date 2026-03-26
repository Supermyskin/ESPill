#include "HeaderFile.h"
#include "RTClib.h"
#include "Servo.h"
class Box {
  public:
    uint8_t SERVO = A1;
    uint8_t LED;
    Servo myServo;
    void init(){
      myServo.attach(SERVO);
    }
    void open(){
      digitalWrite(BUZZ, HIGH);
      digitalWrite(LED, HIGH);
      myServo.write(180);
    }
    void close(){
      digitalWrite(BUZZ, LOW);
      digitalWrite(LED, LOW);
      myServo.write(90);
    }

DS1302 rtc(CLOCK_RST, CLOCK_CLK, CLOCK_DATA);
Box BoxArray[6] = {Box1, Box2, Box3, Box4, Box5, Box6};

void setup(){
  box.LED = A2;
  Serial.begin(9600);
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(BUZZ, OUTPUT);
  if(!rtc.isrunning()){
    rtc.begin();
  }
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  for(int i = 0; i < 6; i++){
    BoxArray[i].init()
  }
}


void loop(){
  if(Serial.available() >= 6){
    a = Serial.read();
    if(a == 'y'{
      b = Serial.read();
      if(b == 'b'){
        Serial.readBytesUntill('\0', EatTime.year, 1);
        Serial.readBytesUntill('\0', EatTime.day, 1);
        Serial.readBytesUntill('\0', EatTime.minute, 1);
        Serial.readBytesUntill('\0', EatTime.box, 1);
      }
    })
  }
  for(int i = 0; i < 8, i++){
    if(EatTime.box & (1 << i)){
      
    }
  }
}

