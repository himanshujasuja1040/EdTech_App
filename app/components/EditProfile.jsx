import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  useWindowDimensions,
  Platform
} from 'react-native';
import  Colors  from '../../constants/Colors';
import { AuthContext } from '../AuthContext/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const EditProfile = () => {
  const { name: contextName } = useContext(AuthContext);
  // const Colors={
  //   WHITE: '#fff',
  //   PRIMARY: '#000',
  //   GRAY: '#7d7d7d',
  //   LIGHT_GRAY: '#f0f0f0',
  // }
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigation = useNavigation();

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  useEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  // Preload current user data
  useEffect(() => {
    setFullName(contextName || '');
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
    }
  }, [contextName]);

  const handleUpdateProfile = async () => {
    if (!email.trim() || !fullName.trim()) {
      const msg = 'Please Enter All Details';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('', msg);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = 'Invalid Email Format';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('', msg);
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          fullName,
          email,
        });
        // Instead of immediately navigating, show a success message.
        setUpdateSuccess(true);
        Alert.alert('Reload Your Application');

        // Wait 2 seconds before navigating back.
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={[styles.container, !isPortrait && styles.containerLandscape]}>
        {/* Full Name */}
        <View style={{ marginTop: 50 }}>
          <Text style={{ fontFamily: 'outfit' }}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor='#888'
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
            placeholderTextColor='#888'
            value={email}
            onChangeText={setEmail}
          />
        </View>


        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* After-loading success message */}
        {updateSuccess && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.PRIMARY} />
            <Text style={styles.successText}>Profile updated successfully!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  containerLandscape: {
    paddingHorizontal: 32,
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  successText: {
    marginLeft: 8,
    fontFamily: 'outfit',
    fontSize: 16,
    color: Colors.PRIMARY,
  },
});

export default EditProfile;
