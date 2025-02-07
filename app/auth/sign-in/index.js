import React, { useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity,ToastAndroid } from 'react-native'
import { useNavigation, useRouter } from 'expo-router'
import { useState } from 'react'
import { Colors } from '../../../constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../configs/firebaseConfig';

const SignIn = () => {
  const navigation = useNavigation()
  const router = useRouter();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [navigation])

  const [password,setPassword]=useState('');
  const [email,setEmail]=useState('');

  const onSignIn = () => {
    if (!email.trim() || !password.trim()) {
        ToastAndroid.show('Please Enter All Details', ToastAndroid.LONG);
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        ToastAndroid.show('Invalid Email Format', ToastAndroid.LONG);
        return;
    }

    signInWithEmailAndPassword(auth, email.trim(), password.trim())
        .then((userCredential) => {
            console.log(userCredential.user);
            router.replace('/(tabs)/home')
        })
        .catch((error) => {
            console.log(error.code, error.message);

            if (error.code === 'auth/invalid-credential') {
                ToastAndroid.show('Invalid Email or Password', ToastAndroid.LONG);
            } else if (error.code === 'auth/too-many-requests') {
                ToastAndroid.show('Too many attempts. Try again later.', ToastAndroid.LONG);
                // Optionally, you can redirect the user to reset the password
            } else {
                ToastAndroid.show(error.message, ToastAndroid.LONG);
            }
        });
};


  return (
    <View style={{ padding: 25, backgroundColor: Colors.WHITE, height: '100%', paddingTop: 40 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{ fontFamily: 'outfit-bold', fontSize: 30, color: Colors.PRIMARY, marginTop: 30 }}>Let's Sign You In</Text>
      <Text style={{ fontFamily: 'outfit', fontSize: 30, color: Colors.GRAY, marginTop: 20 }}>WELCOME BACK</Text>
      <Text style={{ fontFamily: 'outfit', fontSize: 30, color: Colors.GRAY, marginTop: 10 }}>You've been missed!</Text>
      {/* Email  */}
      <View style={{ marginTop: 50 }}>
        <Text style={{ fontFamily: 'outfit' }}>Email</Text>
        <TextInput style={styles.input} placeholder='Enter Email' onChangeText={(value)=>setEmail(value)}/>
      </View>
      {/* Password */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Password</Text>
        <TextInput style={styles.input} secureTextEntry={true} placeholder='Enter Password' onChangeText={(value)=>setPassword(value)}/>
      </View>
      {/* Sign In Button  */}
      <TouchableOpacity style={{ padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 15, marginTop: 50 }} onPress={onSignIn}>
        <Text style={{ color: Colors.WHITE, textAlign: 'center' }}>Sign In</Text>
      </TouchableOpacity>
      {/* Create Account Button  */}
      <TouchableOpacity style={{ padding: 15, backgroundColor: Colors.WHITE, borderRadius: 15, marginTop: 20, borderWidth: 1 }} onPress={() => router.replace('auth/sign-up')}>
        <Text style={{ color: Colors.PRIMARY, textAlign: 'center' }}>Create Account</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    fontFamily: 'outfit'
  }
})
export default SignIn