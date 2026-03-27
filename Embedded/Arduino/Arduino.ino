#include "HeaderFile.h"
#include "RTClib.h"
#include "Servo.h"
#include "Types.h"

bool boo = false;
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
Box BoxArray[] = {Box(A3, A2)};
bool data_received = false;

void setup(){
  Serial.begin(115200);
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(BUZZ, OUTPUT);

  rtc.begin();

  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

  for(int i = 0; i < 1; i++){
    BoxArray[i].init();
  }
}

// void loop(){
//   // Serial.println("Waiting for input");
//   DateTime now = rtc.now();
//   uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());

//   if(now.minute() != lastMinute){
//     already_triggered = false;
//     lastMinute = now.minute();
//   }

//   if(Serial.available() >= 7){
//     uint8_t a = Serial.read();
//     if(a == 'y'){
//       uint8_t b = Serial.read();
//       if(b == 'b'){
//         uint8_t day = Serial.read();
//         uint8_t hour = Serial.read();
//         uint8_t minute = Serial.read();
//         uint8_t boxes = Serial.read();
//         uint8_t checksum = Serial.read();
//         if(day ^ hour ^ minute ^ boxes == checksum){
//           eatTime.day = day;
//           eatTime.hour = hour;
//           eatTime.minute = minute;
//           eatTime.box = boxes;
//           data_received = true;

//           // Serial.println("VALID DATA");
//         // } else {
//         //   // Serial.println("CHECKSUM ERROR");
//         }
//       }
//     }
//   }

//   if(data_received){
//     if(eatTime.day == dow &&
//        eatTime.hour == now.hour() &&
//        eatTime.minute == now.minute() &&
//        !already_triggered)
//     {
//       already_triggered = true;

//       for(int i = 0; i < 1; i++){
//         if(eatTime.box & (1 << i)){
//           // Serial.println("Open The box");
//           BoxArray[i].open();
//           waitTakePills();
//           BoxArray[i].close();
//           // Serial.println("Close the box");
//         }
//         // Serial.print("Say you're done");
//         Serial.write("yb");
//         Serial.write('0');
//         Serial.write('1');
//       }
//     }
//   }
//   if(!boo){
//     boo = true;
//     Serial.write("yb01");
//   }
//   delay(200);
// }
void loop(){
  DateTime now = rtc.now();
  uint8_t dow = dayOfWeek(now.year(), now.month(), now.day());
  Serial.print(now.hour());
  Serial.print(":");
  Serial.print(now.minute());
  Serial.print(" | DOW: ");
  Serial.println(dow);


  Serial.print("[SERIAL] Available: ");
  Serial.println(Serial.available());

  if(Serial.available() >= 7){


    uint8_t a = Serial.read();
    uint8_t b = Serial.read();

    if(a == 'y' && b == 'b'){
      uint8_t day = Serial.read();
      uint8_t hour = Serial.read();
      uint8_t minute = Serial.read();
      uint8_t boxes = Serial.read();
      uint8_t checksum = Serial.read();

      Serial.println("[SERIAL] Data received:");
      Serial.print("day: "); Serial.println(day);
      Serial.print("hour: "); Serial.println(hour);
      Serial.print("minute: "); Serial.println(minute);
      Serial.print("boxes: "); Serial.println(boxes);
      Serial.print("checksum: "); Serial.println(checksum);

      uint8_t calc = day ^ hour ^ minute ^ boxes;

      if(calc == checksum){
        Serial.println("[SERIAL] CHECKSUM OK");

        eatTime.day = day;
        eatTime.hour = hour;
        eatTime.minute = minute;
        eatTime.box = boxes;
        data_received = true;

      } else {
        Serial.println("[SERIAL] CHECKSUM FAIL");
      }
    } else {
      Serial.println("[SERIAL] WRONG HEADER");
    }
  }

  if(data_received){
    Serial.println("[LOGIC] Checking schedule...");

    Serial.print("eatTime.day: "); Serial.println(eatTime.day);
    Serial.print("eatTime.hour: "); Serial.println(eatTime.hour);
    Serial.print("eatTime.minute: "); Serial.println(eatTime.minute);

    if(eatTime.day <= dow &&
       eatTime.hour <= now.hour() &&
       eatTime.minute <= now.minute()/* &&
       !already_triggered*/)
    {
      Serial.println("[LOGIC] !!! TRIGGERED !!!");



      for(int i = 0; i < 1; i++){
        Serial.print("[BOX] Checking box ");
        Serial.println(i);

        if(eatTime.box & (1 << i)){
          Serial.println("[BOX] OPEN");

          BoxArray[i].open();
          delay(20);
          waitTakePills();
          BoxArray[i].close();

          Serial.println("[BOX] CLOSE");
        }
      }

      Serial.println("[SERIAL] Sending done signal");
      Serial.write("yb");
      Serial.write('0');
      Serial.write('1');
    } else {
      Serial.println("[LOGIC] Conditions not met");
    }
  }

  if(!boo){
    Serial.println("[INIT] Requesting schedule");
    boo = true;
    Serial.write("yb01");
  }

  delay(3000);
}

