struct EatTime{
  uint8_t day;
  uint8_t hour;
  uint8_t minute;
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

void fillSchedule(EatTime* schedule, unsigned int maxSize, unsigned int& sc_len,
                  const byte* payload, unsigned int pd_len) {

  DynamicJsonDocument scheduleJson(45000);
  DeserializationError error = deserializeJson(scheduleJson, payload, pd_len);
  if (error) {
    Serial.println(error.c_str());
    return;
  }

  JsonArray arr = scheduleJson["schedule"];
  sc_len = 0;  

  for (JsonObject obj : arr) {
    if (sc_len >= maxSize) break;

    schedule[sc_len].day = obj["d"];      // day
    schedule[sc_len].hour = obj["h"];     // hour
    schedule[sc_len].minute = obj["m"];   // minute
    schedule[sc_len].boxes = obj["b"]; // boxes bitmask

    sc_len++;
  }
}

