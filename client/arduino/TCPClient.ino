/*
  modified Webclient from the Arduino Examples (by David A. Mellis)
  to a simple TCP Client (original code: http://www.ahorndesign.com )
  Adapted by Paperpixel Std. for relab - ( http://www.relab.be )
  Requires:
    - Arduino Soft Timer library : https://code.google.com/p/arduino-softtimer/
    - Arduino  PCIManager library: https://code.google.com/p/arduino-pcimanager/

   Also Requires custom HashtagLampUtils library

 */

/*
    TODO
    - Create an array with the pin numbers ordered (ex: [8,5,3] the pin number returned by server will be the index in the array)
    - Create timer for pin High duration (the delay stops the loop)
    - every n loops, test the connection + reconnect in case not connected anymore
    - implement server handshake [ based upon an actuator]
    - implement flashing led in case of error

*/

#include <SPI.h>
#include <Ethernet.h>

/*
 * CONNECTION
 */
byte mac[] = {  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress serverIP(188, 165, 193, 200); // IP Adress to our Server
int serverPort=33333;
EthernetClient client;
const int CONNECTION_CHECK_DELAY = 10000;
unsigned long lastConnCheck = 0;

/*
 * CONTROLS
 */
const int button_pin = A0;
int button_state = 0;
//const int ERROR_LED_PIN = *****;

/*
 * PINS & Timers
 */

int BULB_PINS[] = {3,4, 5, 6, 7, 8, 9, 10};
int HASHTAG_SET = 1;
//unsigned long bulbTimers = {0,0,0,0,0,0,0,0};

// packages content
String hashtag_num;
String tweet_length;
boolean is_after_pipe;

void setup() {
  pinMode(button_pin, INPUT);
  int i;
  for(i = 0; i < sizeof(BULB_PINS); i++) {
    pinMode(BULB_PINS[i], OUTPUT);
  }
  //pinMode(2, OUTPUT);
  //pinMode(3, OUTPUT);
  //pinMode(5, OUTPUT);
  
  // start the serial for debugging
  Serial.begin(9600);
  // start the Ethernet connection:
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // no point in carrying on, so do nothing forevermore:
    for(;;)
      ;
  }
  // give the Ethernet shield a second to initialize:
  delay(1000);
  
  connectToServer();
}

void loop()
{
  button_state = digitalRead(button_pin);
  
  // if there are incoming bytes available 
  // from the server, read them and print them:
  if (client.available()) {
    char c = client.read();

    if(c == '~') { // choose wich hashtag set is wanted (1 or 2)
        client.print(HASHTAG_SET);
        Serial.print("Hashtag set ");
        Serial.println(HASHTAG_SET);
    }

    // check buffer for hashtags
    if(c != '|' && is_after_pipe == false) {
      hashtag_num += c; // hashtag number
    } else if(c != '<' && is_after_pipe == true) {
      tweet_length += c; // tweet length
    } else if(c == '|') {
      is_after_pipe = true;
    } else if(c == '<') {
      processTweet(hashtag_num, tweet_length); // end of message
      hashtag_num = "";
      tweet_length = "";
      is_after_pipe = false;
    }
  }

  if(button_state == HIGH) {
    //connectToServer();
    //delay(1000);
  }

  checkConnection();
}


void processTweet(String hashtag_num_str, String tweet_length_str) {
    int hashtag_num = hashtag_num_str.toInt();
    int tweet_length = tweet_length_str.toInt();
    int bulb_pin = BULB_PINS[hashtag_num-1];

    Serial.print("lighting up bulb on pin #");
    Serial.println(bulb_pin);

    digitalWrite(bulb_pin, HIGH);
    delay(500);
    digitalWrite(bulb_pin, LOW);
}



void disconnectFromServer() {
  // if the server's disconnected, stop the client:
    client.stop();
}

void connectToServer() {
  disconnectFromServer();
  
   Serial.println("connecting to Server ...");

  // if you get a connection to the Server
  if (client.connect(serverIP, serverPort)) {
    Serial.println("connected");//report it to the Serial
  } 
  else {
    // if you didn't get a connection to the server:
    Serial.println("connection failed");
  }
}


/**
* checks connection every n milliseconds (see CONNECTION_CHECK_DELAY)
* and tries to reconnect if disconnected
**/
void checkConnection() {
    if(millis() > (lastConnCheck + CONNECTION_CHECK_DELAY)) {
        if (!client.connected()) {
            Serial.println("disconnected.");
            connectToServer();
            lastConnCheck = millis();
        }
    }
}
