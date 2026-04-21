#include "HeaderFile.h"
#include "RTClib.h"
#include "Types.h"

uint8_t dayOfWeek(int year, uint8_t month, uint8_t day) {
    if (month < 3) {
        month += 12;
        year--;
    }

    int K = year % 100;
    int J = year / 100;

    int h = (day + 13 * (month + 1) / 5 + K + K / 4 + J / 4 + 5 * J) % 7;

    return h;
}
void waitTakePills() {
    const int threshold = 6;
    const int confirmTime = 200;

    unsigned long detectStart = 0;

    Serial.println("Take the pill!");

    // WAIT FOR OBJECT
    while (true) {
        int distance = CheckDistance();

        Serial.print("Dist: ");
        Serial.println(distance);

        if (distance <= threshold) {
            if (detectStart == 0) {
                detectStart = millis();
            }

            if (millis() - detectStart >= confirmTime) {
                break; 
            }
        } else {
            detectStart = 0;
        }

        delay(20);
    }

    Serial.println("Pill Taken");

    delay(300);

    detectStart = 0;

    while (true) {
        int distance = CheckDistance();

        Serial.print("Dist: ");
        Serial.println(distance);

        if (distance > threshold) {
            if (detectStart == 0) {
                detectStart = millis();
            }

            if (millis() - detectStart >= confirmTime) {
                break;
            }
        } else {
            detectStart = 0;
        }

        delay(20);
    }
}