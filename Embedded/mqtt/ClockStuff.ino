#include "HeaderFile.h"
#include "RTClib.h"
#include "Types.h"

uint8_t dayOfWeek(int year, uint8_t month, uint8_t day) {
    if (month < 3) {
        month += 12;
        year--;
    }

    uint8_t K = year % 100;
    uint8_t J = year / 100;

    return (day + 13 * (month + 1) / 5 + K + K / 4 + J / 4 + 5 * J) % 7;
}

void waitTakePills(){
    uint8_t Distance[4];

    for(int i = 0; i < 4; i++){
        Distance[i] = CheckDistance();
    }

    uint8_t avg_distance =
        (Distance[0] + Distance[1] + Distance[2] + Distance[3]) / 4;

    Serial.println("Take the pill!");

    while(avg_distance > 6){
        Serial.print("Avg: ");
        Serial.println(avg_distance);

        for(int i = 0; i < 4; i++){
            Distance[i] = CheckDistance();
        }

        avg_distance =
            (Distance[0] + Distance[1] + Distance[2] + Distance[3]) / 4;

        delay(60);
    }

    Serial.println("Pill Taken");
    Serial.write("yb+1");

    delay(1000);

    for(int i = 0; i < 4; i++){
        Distance[i] = CheckDistance();
    }

    avg_distance =
        (Distance[0] + Distance[1] + Distance[2] + Distance[3]) / 4;

    while(avg_distance <= 6){
        for(int i = 0; i < 4; i++){
            Distance[i] = CheckDistance();
        }

        avg_distance =
            (Distance[0] + Distance[1] + Distance[2] + Distance[3]) / 4;

        delay(50);
    }
}