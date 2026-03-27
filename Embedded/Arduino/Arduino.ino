#include "HeaderFile.h"
#include "RTClib.h"
#include "Servo.h"
#include "Types.h"
bool boo = false;

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
  Serial.println("Waiting for input");
  DateTime now = rtc.now();
  uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());
  if(Serial.available() >= 6){
    uint8_t a = Serial.read();
    if(a == 'y'){
      uint8_t b = Serial.read();
      if(b == 'b'){
        Serial.println("Received Input");
        eatTime.day = Serial.read();
        eatTime.hour = Serial.read();
        eatTime.minute = Serial.read();
        eatTime.box = Serial.read();
        data_received = true;
      }
    }
  }
  if(data_received){
    if(eatTime.day == dow && eatTime.hour == now.hour() && eatTime.minute == now.minute())
      for(int i = 0; i < 1; i++){
        if(eatTime.box & (1 << i)){
          Serial.println("Open The box");
          BoxArray[i].open();
          waitTakePills();
          BoxArray[i].close();
          Serial.println("Close the box");
        }
        Serial.print("Say you're done");
        Serial.write("yb");
        Serial.write('0');
        Serial.write('1');

      }  

  }
  if(!boo){
    Serial.println("Sent Request");
    Serial.write("yb");
    Serial.write('0');
    Serial.write('1');
    boo = true;
  }

  delay(200);    
}


