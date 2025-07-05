// Views
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import Slider from '../component/Slider';
import { StyleSheet, Button, Image, Text, View } from 'react-native';

// Navigation
import { useNavigation } from '@react-navigation/native';

export default function Intro() {
    const navigation = useNavigation();

    return(
        <SafeAreaView style={styles.container}>
            <Slider />
            <Button title='Setup' onPress={() => navigation.navigate('Setup')} />
        </SafeAreaView>
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
