import { Image, StyleSheet, Text, View, Dimensions } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const {width, height} = Dimensions.get('screen');
const Stack = createNativeStackNavigator();

const SlideItem = ({item}) => {
  return (
    <View style={styles.container}>
        <Image source={item.image} resizeMode="contain" style={styles.image} />

        <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.keywords}>{item.keywords}</Text>
        </View>

        {/* <Button style={styles.container} onPress={} title='Skip Tour' color="#FFA500" /> */}
    </View>
  )
}

export default SlideItem

const styles = StyleSheet.create({
    container: {
        width,
        height,
        alignItems: 'center'
    },
    image: {
        width: 200,
        height: 200
    },
    content: {
        flex: 0.4,
        alignItems: 'center'
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#333'
    },
    description: {
        fontSize: 18,
        marginVertical: 12,
        marginHorizontal: 50,
        textAlign: 'center',
        color: '#333'
    },
    keywords: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "Bebas Neue"
    }
})