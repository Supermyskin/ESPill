struct EatTime{
  uint8_t day;
  uint8_t hour;
  uint8_t minute;
  uint8_t box;
};

uint8_t dayOfWeek(int year, uin8_t month, uint8_t day) {
    if (month < 3) {
        month += 12;
        year--;
    }
    uin8_t K = year % 100;
    uin8_t J = year / 100;

    return (day + 13*(month+1)/5 + K + K/4 + J/4 + 5*J) % 7;
}


