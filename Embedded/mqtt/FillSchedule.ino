int findKey(const byte* payload, unsigned int start, unsigned int pd_len, const char* key) {
  for (unsigned int i = start; i < pd_len; i++) {
    bool match = true;
    for (unsigned int j = 0; key[j] != '\0'; j++) {
      if (payload[i + j] != key[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

int readInt(const byte* payload, unsigned int& i) {
  int val = 0;
  while (payload[i] < '0' || payload[i] > '9') i++;
  while (payload[i] >= '0' && payload[i] <= '9') {
    val = val * 10 + (payload[i] - '0');
    i++;
  }
  return val;
}

void fillSchedule(EatTime* schedule, unsigned int maxSize, unsigned int& sc_len,
                  const byte* payload, unsigned int pd_len) {

  unsigned int i = 0;
  sc_len = 0;

  while (sc_len < maxSize) {

    int dPos = findKey(payload, i, pd_len, "\"d\"");
    if (dPos == -1) break;

    i = dPos;
    i = dPos;
    i += 3;
    EatTime buffer;

    buffer.day = readInt(payload, i);

    int hPos = findKey(payload, i, pd_len, "\"h\"");
    i = hPos + 3;
    buffer.hour = readInt(payload, i);

    int mPos = findKey(payload, i, pd_len, "\"m\"");
    i = mPos + 3;
    buffer.minute = readInt(payload, i);

    int aPos = findKey(payload, i, pd_len, "\"a\"");
    i = aPos;

    // move to '['
    while (payload[i] != '[' && i < pd_len) i++;
    i++;

    for (int k = 0; k < 6; k++) {
      buffer.pills[k] = readInt(payload, i);
    }

    schedule[sc_len++] = buffer;

    if (findKey(payload, i, pd_len, "]") == -1) break;
  }
}