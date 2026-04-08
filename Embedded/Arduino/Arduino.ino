#include "HeaderFile.h"
#include "RTClib.h"
#include "Servo.h"
#include "Types.h"

uint8_t lastMinute = 255;

class Box {
  public:
    uint8_t SERVO;
    uint8_t LED;

    Servo myServo;

    Box(uint8_t servoPin, uint8_t ledPin){
      SERVO = servoPin;
      LED = ledPin;
    }

    void init(){
      pinMode(LED, OUTPUT);
      myServo.attach(SERVO);
      myServo.write(0);
    }

    void open(){
      digitalWrite(BUZZ, HIGH);
      digitalWrite(LED, HIGH);
      myServo.write(90);
    }

    void close(){
      digitalWrite(BUZZ, LOW);
      digitalWrite(LED, LOW);
      myServo.write(0);
    }
};

DS1302 rtc(CLOCK_RST, CLOCK_CLK, CLOCK_DATA);

// ⚠️ если это не специально — поменяй LED пины
Box BoxArray[] = {
  Box(A3, A6),
  Box(A2, A6),
  Box(A1, A6)
};

bool data_received = false;

void setup(){
  Serial.begin(115200);

  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(BUZZ, OUTPUT);

  rtc.begin();

  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

  for(int i = 0; i < 3; i++){
    BoxArray[i].init();
  }
}

void loop(){
  DateTime now = rtc.now();
  uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());
  Serial.println("TIME: ");
  Serial.println(dow);
  Serial.println(now.hour());

  Serial.print(":");
  Serial.print(now.minute());


  // =========================
  // 📥 ПРИЕМ ДАННЫХ
  // =========================
  if(Serial.available() >= 7){
    uint8_t a = Serial.read();
    uint8_t b = Serial.read();

    if(a == 'y' && b == 'b'){
      uint8_t day = Serial.read();
      uint8_t hour = Serial.read();
      uint8_t minute = Serial.read();
      uint8_t boxes = Serial.read();
      uint8_t checksum = Serial.read();

      uint8_t calc = day ^ hour ^ minute ^ boxes;

      if(calc == checksum){
        eatTime.day = day;
        eatTime.hour = hour;
        eatTime.minute = minute;
        eatTime.box = boxes;
        Serial.println("EatTime:");
        Serial.println(day);
        Serial.println(hour);
        Serial.println(minute);
        data_received = true;

        Serial.println("[SERIAL] OK");
      } else {
        Serial.println("[SERIAL] CHECKSUM FAIL");
      }
    } else {
      Serial.println("[SERIAL] WRONG HEADER");
    }
  }

  // =========================
  // ⏰ ЛОГИКА ТРИГГЕРА
  // =========================
  if(data_received){
    if(/*eatTime.day == dow &&*/
       eatTime.hour == now.hour() &&
       eatTime.minute == now.minute() &&
       now.minute() != lastMinute)
    {
      Serial.println("[LOGIC] !!! TRIGGERED !!!");

      lastMinute = now.minute();

      for(int i = 0; i < 3; i++){
        if(eatTime.box & (1 << i)){
          Serial.print("[BOX] OPEN ");
          Serial.println(i);

          BoxArray[i].open();
          delay(20);

          waitTakePills();

          BoxArray[i].close();

          Serial.print("[BOX] CLOSE ");
          Serial.println(i);
        }
      }
    }
  }

  // =========================
  // 📡 ЗАПРОС РАСПИСАНИЯ
  // =========================
  if(!data_received){
    Serial.println("[INIT] Requesting schedule");
    Serial.write("yb01");
  }

  delay(500);
}