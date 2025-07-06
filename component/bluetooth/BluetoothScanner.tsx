// Memo & States
import { useEffect, useState, useMemo } from 'react';

// UI Components
import { Platform, PermissionsAndroid } from 'react-native';

// Bluetooth
import { BleManager, Device, DeviceId } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';

// UUID - (Use primary: ESP32 | Nodemcu ESP8266 ESP-12E ESP CP2102 (Requires bluetooth-module))
const ARD_BLUETOOTH_MODULE_UUID = "12345678-1234-1234-1234-1234567890ab";
const ARD_NOTIFY_CHARACTERISTIC = "99999999-aaaa-bbbb-cccc-999999999999"; // same as in Arduino

interface BluetoothLowEnergyAPI {
  requestPermissions(): Promise<boolean>;
  scanForCoffeMachine(): void;
  allDevices: Device[];
  connectToDevice: (deviceId: Device) => Promise<void>;
  connected: Device | null;
  brewCoffee(): void;
}

function useBLE(): BluetoothLowEnergyAPI {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connected, setConnectedDevice] = useState<Device | null>(null); 

  // Request permissions for Android 12+ (API 31+)
  const requestAndroidPermission31Permissions = async () => {
    try {
      const bluetoothScanPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Access to Bluetooth Scan',
          message: 'Coffee Maker needs access to your Bluetooth module to scan for devices',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );

      const bluetoothConnectPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Access to Bluetooth Connect',
          message: 'Coffee Maker needs access to your Bluetooth module to connect to devices',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );

      const bluetoothLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Access to Location',
          message: 'Coffee Maker needs access to your Location to scan for devices',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );

      return (
        bluetoothConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
        bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
        bluetoothLocationPermission === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.warn(error);
      return false;
    }
  };

  // Request permissions based on API level
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const apiLevel = ExpoDevice.platformApiLevel ?? -1;

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth requires Location',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return await requestAndroidPermission31Permissions();
      }
    }

    // iOS or other platforms
    return true;
  };

  // Check for duplicate device by ID
  const isDuplicateDevice = (devices: Device[], nextDevice: Device): boolean =>
    devices.some((device) => device.id === nextDevice.id);

  // Scan for CorSense devices
  const scanForCoffeMachine = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan error:', error);
        return;
      }

      if (device && device.name?.includes('CorSense')) {
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

const connectToDevice = async (device: Device) => {
  try {
    const deviceConnection = await bleManager.connectToDevice(device.id);
    setConnectedDevice(deviceConnection);
    await deviceConnection.discoverAllServicesAndCharacteristics();
    bleManager.stopDeviceScan();

    await startStreamingData(deviceConnection);  // Start listening for "DONE"
  } catch (e) {
    console.error("ERROR IN CONNECTION: ", e);
  }
};

const brewCoffee = async () => {
  try {
    if (connected) {
      const service = await connected.services();
      const characteristics = await connected.characteristicsForService(ARD_BLUETOOTH_MODULE_UUID);

      await connected.writeCharacteristicWithResponseForService(
        ARD_BLUETOOTH_MODULE_UUID,
        ARD_NOTIFY_CHARACTERISTIC,
        Buffer.from("ON").toString("base64")
      );

      console.log("Coffee command sent!");
    } else {
      console.log("Not connected to Coffee Machine");
    }
  } catch (error) {
    console.error("Error Occurred Trying To Make Coffee", error);
  }
};

const startStreamingData = async (device: Device) => {
  try {
    await device.monitorCharacteristicForService(
      ARD_BLUETOOTH_MODULE_UUID,
      ARD_NOTIFY_CHARACTERISTIC,
      (error, characteristic) => {
        if (error) {
          console.error("Monitor error:", error);
          return;
        }

        const base64Value = characteristic?.value;
        if (base64Value) {
          const decodedValue = Buffer.from(base64Value, 'base64').toString('utf8');
          if (decodedValue === "DONE") {
            console.log("☕ Coffee is done!");
          }
        }
      }
    );
  } catch (e) {
    console.error("Failed to monitor characteristic:", e);
  }
};

  return {
    requestPermissions,
    scanForCoffeMachine,
    allDevices,
    connected,
    connectToDevice,
    brewCoffee,
  };
}

export default useBLE;
