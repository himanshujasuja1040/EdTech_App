import { Colors } from '@/constants/Colors';
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';

const Login = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const imageHeight = height * 0.6; 
  const navigation=useNavigation()
  useEffect(()=>{
    navigation.setOptions({
      headerShown: false,
    })
  })
  return (
    <View style={styles.container}>
      <Image 
        source={require("../../assets/images/image4.jpg")}
        style={[styles.image, { height: imageHeight }]}
      />
      <View style={[styles.contentContainer, { paddingHorizontal: width * 0.05 }]}>
        <Text style={styles.title}>ABHISHEK BHAIYA CLASSES</Text>
        <Text style={styles.description}>
          Radhe Radhe Bacho ...... !!
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('auth/sign-in')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    backgroundColor: Colors.WHITE,
    marginTop: -15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    fontFamily: 'outfit',
    textAlign: 'center',
    color: Colors.GRAY,
    marginTop: 20,
    width: '90%',
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 99,
    marginTop: '10%',
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'outfit',
    fontSize: 18,
  },
});

export default Login;
