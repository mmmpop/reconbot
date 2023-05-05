// packages

#include <Servo.h>
#include <SoftwareSerial.h>
#include <Arduino_JSON.h>
#include <Adafruit_MPL3115A2.h>

// constants

#define str_ang_d 45
#define ss_p 13
#define rs_p 12
#define left_servo_pin 11
#define drive_servo_zero_speed 1500
#define rx_pin  2
#define tx_pin  3

// global varriables

int forward_speed_step = 50;
int reverse_speed_step = -50;
int right_angle = 45;
int left_angle = -45;
int timeout_var = 0;
// int prev_speed;
// int prev_angle;

// char* keystroke;
// String jsonIn = "";

// servos

Servo steering_servo;
Servo right_servo;
Servo left_servo;

// Serial

// SoftwareSerial Serial2(rx_pin, tx_pin);


// barometric sensor

Adafruit_MPL3115A2 baro;

// functions

void Turn(int angle){
  int scalar = 1;
  steering_servo.write(str_ang_d - angle*scalar);
}

void Drive(int speed, int scalar){
  // int scalar = 1;
  right_servo.writeMicroseconds(drive_servo_zero_speed - scalar*speed);
  left_servo.writeMicroseconds(drive_servo_zero_speed + scalar*speed);
}

void DriveControl(String Input, int speed_scalar){
  
  if(Input != ""){
    Serial.println(Input);
    //Serial.println(speed_scalar);
  }
  else{
    //Turn(0);
  }

  //int current_angle = 0;
  //nt current_speed = 0;
  
  if(Input == "space"){
    Turn(0);
    Drive(0, speed_scalar);
  }
  if(Input == "arrow_right"){
    Turn(right_angle);
    Drive(forward_speed_step, speed_scalar);
  }
  if(Input == "arrow_left"){
    Turn(left_angle);
    Drive(forward_speed_step, speed_scalar);
  }
  if(Input == "arrow_up"){
    Serial.println("Arrow up recieved by control loop");
    Turn(0);
    Drive(forward_speed_step, speed_scalar);
  }
  if(Input == "arrow_down"){
    Turn(0);
    Drive(reverse_speed_step, speed_scalar);
  }
}

void setup() {
  //Serial.println("setup");
  //baro.setSeaPressure(1013.26);
  Serial2.begin(9600);
  Serial.begin(9600);
  steering_servo.attach(ss_p);
  right_servo.attach(rs_p);
  left_servo.attach(left_servo_pin);
  Serial.println("Start");  
}

void loop() {
  JSONVar req;
  if (Serial2.available() > 0) {
    const String s = Serial2.readString();
    Serial.println(s.c_str());
    req = JSON.parse((const char*)JSON.parse(s.c_str()));

    if (JSON.typeof(req) != "undefined") {
      // Serial.println(JSON.typeof(req["package"]["keystroke"]));
    }
    else {
      Serial2.flush();
    }
  }
  
  DriveControl(req["package"]["keystroke"], req["package"]["speed_scalar"]);
  // Serial.println((const char*) req["package"]["keystroke"]);
  // delay(100);
  
  
  JSONVar ret;
  ret["return_data"]["TempC"] = baro.getTemperature();
  ret["return_data"]["Altitude"] = baro.getAltitude();
  ret["timestamp"] = req["timestamp"];
  
  if(Serial2.availableForWrite() != 0){
    Serial2.println(JSON.stringify(ret));
  }
  

  //Serial2.println("please help");
  //Serial2.println(baro.getAltitude());
  
}
