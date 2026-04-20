void fillSchedule(EatTime* schedule, unsigned int maxSize, unsigned int& sc_len,
                  const byte* payload, unsigned int pd_len) {

  DynamicJsonDocument scheduleJson(32000);
  DeserializationError error = deserializeJson(scheduleJson, payload, pd_len);
  if (error) {
    Serial.println(error.c_str());
    return;
  }

  JsonArray arr = scheduleJson.as<JsonArray>();
  sc_len = 0;
  for (JsonObject obj : arr) {
    if (sc_len >= maxSize) break;
    schedule[sc_len].day = obj["d"] | 255;
    schedule[sc_len].hour = obj["h"] | 255;
    schedule[sc_len].minute = obj["m"] | 255;
    JsonArray pills = obj["a"] | JsonArray();
    for(int i = 0;i < 6;i++){
      schedule[sc_len].pills[i] = pills[i];
    }
    sc_len++;
  }
}