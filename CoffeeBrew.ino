// Libraries
#include <ArduinoBLE.h>

// Bluetooth Configuration
BLEService coffeeService("19b10000-e8f2-537e-4f6c-d104768a1214"); // Bluetooth® Low Energy LED Service
BLEUnsignedCharCharacteristic commandCharacteristic("19b10000-e8f2-537e-4f6c-d104768a1215", BLERead | BLEWrite | BLENotify | BLEWriteWithoutResponse);

// Internal LED pin
const int ledPin = LED_BUILTIN;
// Relay
#define RELAY_PIN D2 

void setup() {
  Serial.begin(9600); // Baud Rate
  pinMode(RELAY_PIN, OUTPUT); // Relay
  pinMode(ledPin, OUTPUT); // LED

  InitializeAndSetupBT();
}

void loop() {
  ConnectToPeripheral();
}

void InitializeAndSetupBT() {
  // Initializes the Bluetooth® Low Energy device
  if (!BLE.begin()) {
    Serial.println("Failed Starting Bluetooth Low Energy Module!");
    while(1); // Success
  }

  // Set the local value used when advertising
  BLE.setLocalName("Coffee-Machine");

  // Set the advertised service UUID used when advertising to the value of the BLEService provided
  BLE.setAdvertisedService(coffeeService);

  // Add a BLECharacteristic to the Bluetooth® Low Energy service
  coffeeService.addCharacteristic(commandCharacteristic);

  // Add a BLEService to the set of services the Bluetooth® Low Energy device provides
  BLE.addService(coffeeService);

  // Start advertising
  BLE.advertise();
  Serial.println("BLE Coffee Peripheral");
}

void ConnectToPeripheral() {
  // Create BLE Device (central)
  BLEDevice central = BLE.central();

  // Check if connection is active and print details
  if (central) {
      Serial.println("Connected to central: ");
      Serial.println(central.address());
    // If connected check for read and write capabilities
    while (central.connected()) {
      if (commandCharacteristic.canRead() && commandCharacteristic.canWrite()) {

        // Check if the characteristic value has been written by another Bluetooth® Low Energy device
        if (commandCharacteristic.written()) { 
          // When user has selected which coffee, it should start brewing (any value other than 0)
          if (commandCharacteristic.value()) {
            // Turns the Coffee machine ON
            digitalWrite(RELAY_PIN, HIGH);
            digitalWrite(ledPin, HIGH);
            Serial.println("Coffee machine ON");
            // Check if subscribable
            if (commandCharacteristic.canSubscribe())
            {
              Serial.println("characteristic is subscribable");
              
              // Subscribe to a characteristics notification
              commandCharacteristic.subscribe();
              
              // Notify the user on relay output STOP, that coffee is done (coffee machine turned off)
            }
          } else {  // a 0 value
            // Turns the Coffee machine off
            Serial.println("Coffee machine OFF");
            digitalWrite(RELAY_PIN, LOW);
            digitalWrite(ledPin, LOW);
          }
        }
      }
    }
  }
}
