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
Box box;

void setup(){
  box.LED = A2;
  Serial.begin(9600);
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(BUZZ, OUTPUT);
  box.init();
  if(!rtc.isrunning()){
    rtc.begin();
  }
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
}


void loop(){

}

