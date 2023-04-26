// Pinout:
// 3.3v - Vbat
// 5  - Rst
// 2 - Tx
// 3 - Rx
// Gnd - Gnd

// packages
#include <SoftwareSerial.h>
#include <Arduino_JSON.h>

// declarations
#define rstpin 5
#define rxpin  2
#define txpin  3

SoftwareSerial wifi_chip_serial(rxpin, txpin);

void setup() {
  pinMode(rstpin, OUTPUT);
  digitalWrite(rstpin, HIGH);

  Serial.begin(9600);
  wifi_chip_serial.begin(9600);
  Serial.println("Start Test");
}

void loop() {
  if (wifi_chip_serial.available() > 0) {
    const String s = wifi_chip_serial.readString();

    JSONVar req = (const char*)JSON.parse(s.c_str());
    // JSONVar req = JSON.parse((const char*)JSON.parse(s.c_str()));

    if (JSON.typeof(req) == "undefined") {
      Serial.println(s.c_str());
    }
    else {
      // const char* command = req["package"]["keystrokes"];
      // Serial.println(command);

      Serial.println(s.c_str());

      wifi_chip_serial.flush();
      wifi_chip_serial.print(req);
    }
  }
}
