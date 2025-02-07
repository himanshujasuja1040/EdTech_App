import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { AuthContext } from '../AuthContext/AuthContext'; // Adjust path as needed
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { useNavigation } from 'expo-router';

const EditProfile = () => {
  const { name: contextName } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: '',
    })
  }, [])
  // Preload current user data
  useEffect(() => {
    setFullName(contextName || '');
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
    }
  }, [contextName]);

  const handleUpdateProfile = async () => {
    if (!email.trim() || !fullName.trim() || !password.trim()) {
      ToastAndroid.show('Please Enter All Details', ToastAndroid.LONG);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      ToastAndroid.show('Invalid Email Format', ToastAndroid.LONG);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          fullName,
          email,
        });
        Alert.alert('Success', 'Profile updated successfully.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Full Name */}
      <View style={{ marginTop: 50 }}>
        <Text style={{ fontFamily: 'outfit' }}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Email */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder="Enter Password"
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    fontFamily: 'outfit',
    marginTop: 5,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;
