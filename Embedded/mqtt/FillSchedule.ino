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
    schedule[sc_len].day = obj["d"] | 0;
    schedule[sc_len].hour = obj["h"] | 0;
    schedule[sc_len].minute = obj["m"] | 0;
    schedule[sc_len].boxes = obj["b"] | 0;
    JsonArray pills = obj["a"] | JsonArray();
    for(int i = 0;i < 6;i++){
      schedule[sc_len].pills[i] = pills[i];
    }
    sc_len++;
  }
}