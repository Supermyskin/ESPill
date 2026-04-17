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
    delay(1000);

    Serial.println("Pill Taken");

    delay(1000);

}