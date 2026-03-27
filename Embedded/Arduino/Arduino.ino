#include "HeaderFile.h"
#include "RTClib.h"
#include "Servo.h"
#include "Types.h"

bool already_triggered = false;
uint8_t lastMinute = 255;

class Box {

  public:
    uint8_t SERVO;
    uint8_t LED;

    Box(uint8_t servoPin, uint8_t ledPin){
      SERVO = servoPin;
      LED = ledPin;
    };

    Servo myServo;

    void init(){
      pinMode(LED, OUTPUT);
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
};

DS1302 rtc(CLOCK_RST, CLOCK_CLK, CLOCK_DATA);
Box BoxArray[] = {Box(A1, A2)};
bool data_received = false;

void setup(){
  Serial.begin(115200);
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(BUZZ, OUTPUT);

  if(!rtc.isrunning()){
    rtc.begin();
  }

  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

  for(int i = 0; i < 1; i++){
    BoxArray[i].init();
  }
}

void loop(){
  DateTime now = rtc.now();
  uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());

  if(now.minute() != lastMinute){
    already_triggered = false;
    lastMinute = now.minute();
  }

  if(Serial.available() >= 7){
    uint8_t a = Serial.read();
    if(a == 'y'){
      uint8_t b = Serial.read();
      if(b == 'b'){
        uint8_t day = Serial.read();
        uint8_t hour = Serial.read();
        uint8_t minute = Serial.read();
        uint8_t boxes = Serial.read();
        uint8_t checksum = Serial.read();
        if(day ^ hour ^ minute ^ boxes == checksum){
          eatTime.day = d;
          eatTime.hour = h;
          eatTime.minute = m;
          eatTime.box = box;
          data_received = true;
          Serial.println("VALID DATA");
        } else {
          Serial.println("CHECKSUM ERROR");
        }
      }
    }
  }

  if(data_received){
    if(eatTime.day == dow &&
       eatTime.hour == now.hour() &&
       eatTime.minute == now.minute() &&
       !already_triggered)
    {
      already_triggered = true;

      for(int i = 0; i < 1; i++){
        if(eatTime.box & (1 << i)){
          BoxArray[i].open();
          waitTakePills();
          BoxArray[i].close();
        }

        Serial.write("yb");
        Serial.write('0');
        Serial.write('1');
      }
    }
  }
}