import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../../constants/Colors';
import { auth, db } from '../../../configs/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import CustomDropdown from '../../components/CustomDropdown';
import { AuthContext } from '../../AuthContext/AuthContext';

const SignUP = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { selectedStandard, setSelectedStandard } = useContext(AuthContext);

  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const onCreateAccounts = () => {
    if (!email.trim() || !fullName.trim() || !password.trim()) {
      ToastAndroid.show('Please Enter All Details', ToastAndroid.LONG);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      ToastAndroid.show('Invalid Email Format', ToastAndroid.LONG);
      return;
    }

    createUserWithEmailAndPassword(auth, email.trim(), password.trim())
      .then(async (userCredential) => {
        const user = userCredential.user;
        // Store additional user info in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          fullName,
          email: user.email,
          selectedStandard,  // e.g., "12th Class", "NEET", etc.
          createdAt: new Date()
        });
        console.log('User data saved to Firestore:', { fullName, email: user.email, selectedStandard });
        router.replace('/(tabs)/home');
      })
      .catch((error) => {
        console.log(error.code, error.message);
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      });
  };

  const standardOptions = [
    { label: 'JEE MAINS', value: 'JEE MAINS' },
    { label: 'NEET', value: 'NEET' },
    { label: '12th Class', value: '12th Class' },
    { label: '11th Class', value: '11th Class' },
    { label: '10th Class', value: '10th Class' },
    { label: '9th Class', value: '9th Class' },
    { label: '8th Class', value: '8th Class' },
    { label: '7th Class', value: '7th Class' },
    { label: '6th Class', value: '6th Class' },
  ];

  return (
    <View style={{ padding: 25, paddingTop: 50, backgroundColor: Colors.WHITE, height: '100%' }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{ fontFamily: 'outfit-bold', fontSize: 30, marginTop: 30 }}>Create New Account</Text>
      
      {/* Full Name */}
      <View style={{ marginTop: 50 }}>
        <Text style={{ fontFamily: 'outfit' }}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder='Enter Full Name' 
          onChangeText={setFullName}
        />
      </View>
      
      {/* Email */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder='Enter Email' 
          onChangeText={setEmail}
        />
      </View>
      
      {/* Password */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Password</Text>
        <TextInput 
          style={styles.input} 
          secureTextEntry={true} 
          placeholder='Enter Password' 
          onChangeText={setPassword}
        />
      </View>
      
      {/* Standard Dropdown */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Standard</Text>
        <CustomDropdown
          options={standardOptions}
          placeholder="Select"
          selectedValue={selectedStandard}
          onValueChange={setSelectedStandard}
        />
      </View>

      <TouchableOpacity 
        style={{ padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 15, marginTop: 50 }} 
        onPress={onCreateAccounts}
      >
        <Text style={{ color: Colors.WHITE, textAlign: 'center' }}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ padding: 15, backgroundColor: Colors.WHITE, borderRadius: 15, marginTop: 20, borderWidth: 1 }} 
        onPress={() => router.replace('auth/sign-in')}
      >
        <Text style={{ color: Colors.PRIMARY, textAlign: 'center' }}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    fontFamily: 'outfit'
  }
});

export default SignUP;
