#include <ArduinoMqttClient.h>
#include <ESP8266WiFi.h>
#include <string>
// #include <chrono>
#include <iomanip>
#include <iostream>
// #include <NTPClient.h>
// #include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 5
#define DHTTYPE DHT11

WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);
// WiFiUDP ntpUDP;
// NTPClient timeClient(ntpUDP, "pool.ntp.org");

// home
const char ssid[] = "tenementfunster";
const char pass[] = "P3nnyTh3Mutt!"; 
const char broker[] = "192.168.1.25";

// hotspot
// const char ssid[] = "mp_iphone";
// const char pass[] = "bonjour!"; 
// const char broker[] = "172.20.10.6";

int        port     = 1883;
const char subscribe_topic[]  = "feeds/rover/ui";
const char status_topic[] = "feeds/rover/status";
const char feedback_topic[] = "feeds/rover/feedback";
const char err_topic[] = "feeds/rover/error";
const char debug_topic[] = "feeds/rover/debug";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  dht.begin();

  // if (!baro.begin()) {
  //   Serial.println("Couldnt find sensor");
  //   return;
  // }
  // initialize serial and wait for port to open:
  Serial.begin(9600);
  delay(10);

  while(!Serial);
  Serial.println("Starting...");

  // attempt to connect to WiFi network:
  Serial.print("  Attempting to connect to WPA SSID ");
  Serial.println(ssid);
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    // failed, retry
    Serial.println("  Connecting...");
    delay(2500);
  }

  Serial.println("  You're connected to the network ");
  Serial.print("  ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // timeClient.update();

  // each client must have a unique client ID
  mqttClient.setId("rover");

  // you can provide a username and password for authentication
  mqttClient.setUsernamePassword("rover", "bonjour!");

  Serial.print("  Attempting to connect to the MQTT broker ");
  Serial.println(broker);

  if (!mqttClient.connect(broker, port)) {
    Serial.print("  MQTT connection failed! Error code = ");
    Serial.println(mqttClient.connectError());

    while (1);
  }

  Serial.println("  You are connected to the MQTT broker ");
  Serial.println();

  mqttClient.beginMessage(status_topic);
  mqttClient.print("{ \"payload\": { \"message\": \"Sensor connected to broker!\" } }");
  mqttClient.endMessage();

  Serial.print("  Subscribing to topic ");
  Serial.println(subscribe_topic);
  Serial.println();

  // subscribe to a topic
  mqttClient.subscribe(subscribe_topic, 1);

  Serial.print("  Waiting for messages on topic ");
  Serial.println(subscribe_topic);
  Serial.println();
}

// todo: set date/time at wifi invocation; parse JSON 
void loop() {

  // int messageSize = mqttClient.parseMessage();
  // if (messageSize) {
  //   char message[512]; 
  //   DynamicJsonDocument req(512);

  //   // get an MQTT message
  //   while (mqttClient.available()) {
  //     Serial.print((char)mqttClient.read());
  //   }

  delay(2000);

  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  // float t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  // float f = dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  // if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.print(h);
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  // }

  // Compute heat index in Fahrenheit (the default)
  // float hif = dht.computeHeatIndex(f, h);
  // Compute heat index in Celsius (isFahreheit = false)
  // float hic = dht.computeHeatIndex(t, h, false);

  // Serial.print(F("Humidity: "));
  // Serial.print(h);
  // Serial.print(F("%  Temperature: "));
  // Serial.print(t);
  // Serial.print(F("°C "));
  // Serial.print(f);
  // Serial.print(F("°F  Heat index: "));
  // Serial.print(hic);
  // Serial.print(F("°C "));
  // Serial.print(hif);
  // Serial.println(F("°F"));

    DynamicJsonDocument res(512);

    if (Serial.available()) {
      String resData = Serial.readString();
      Serial.print("Got serial data from sensor");
      
      // res["payload"]["res"] = resData;
      mqttClient.beginMessage(feedback_topic);
      mqttClient.print(res.as<String>());
      mqttClient.endMessage();
    }
    
    // mqttClient.beginMessage(debug_topic);
    // mqttClient.print(res.as<String>());
    // mqttClient.endMessage();
    
  // }
}
