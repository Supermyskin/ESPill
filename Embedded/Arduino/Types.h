#ifndef TYPES_H
#define TYPES_H

#include <Arduino.h>

struct EatTime{
  uint8_t day;
  uint8_t hour;
  uint8_t minute;
  uint8_t box;
};

extern EatTime eatTime;

uint8_t dayOfWeek(int year, uint8_t month, uint8_t day);
void waitTakePills();
int CheckDistance();

#endif