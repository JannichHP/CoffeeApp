// Components
import { StyleSheet, Button, Image, Text, View } from 'react-native';

// Navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Bluetooth
import BluetoothScanner from '../component/bluetooth/BluetoothScanner';

const Stack = createNativeStackNavigator();


const Setup = () => {
  const {
    requestPermissions,
    scanForDevices,
    allDevices,
    connectToDevice,
    connected,
    disconnect,
  } = useBLE();

  const scan = async () => {
    const isPermissionsEnabled = await requestPermissions();

    if (isPermissionsEnabled) {
      scanForDevices();
    }
  }

  
}

export default function SetupScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <BluetoothScanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coffeeLogo: {
    height: 200,
    width: 200,
  },

  introButton: {
    height: 200,
    width: 200,
  }
});
