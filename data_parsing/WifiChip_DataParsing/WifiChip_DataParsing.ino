// Pinout:
// 3.3v - Vbat
// 5  - Rst
// 18 - Tx
// 19 - Rx
// Gnd - Gnd

// packages
#include <Arduino_JSON.h>

// declarations
#define rstpin 5

void setup() {
  pinMode(rstpin, OUTPUT);
  digitalWrite(rstpin, HIGH);

  Serial.begin(9600);
  Serial1.begin(9600);
  Serial.println("Start Test");
}

void loop() {
  if (Serial1.available() > 0) {
    const String s = Serial1.readString();

    JSONVar req = (const char*)JSON.parse(s.c_str());
    // JSONVar req = JSON.parse((const char*)JSON.parse(s.c_str()));

    if (JSON.typeof(req) == "undefined") {
      Serial.println(s.c_str());
    }
    else {
      // const char* command = req["package"]["keystrokes"];
      // Serial.println(command);

      Serial.println(s.c_str());

      Serial1.flush();
      Serial1.print(req);
    }
  }
}
