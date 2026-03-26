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