void fillSchedule(EatTime* schedule, unsigned int maxSize, unsigned int& sc_len,
                  const byte* payload, unsigned int pd_len) {

  DynamicJsonDocument scheduleJson(45000);
  DeserializationError error = deserializeJson(scheduleJson, payload, pd_len);
  if (error) {
    Serial.println(error.c_str());
    return;
  }

  JsonArray arr = scheduleJson.as<JsonArray>();
  sc_len = 0;

  for (JsonObject obj : arr) {
    if (sc_len >= maxSize) break;

    schedule[sc_len].day = obj["d"];
    schedule[sc_len].hour = obj["h"];
    schedule[sc_len].minute = obj["m"];
    schedule[sc_len].boxes = obj["b"];

    sc_len++;
  }
}