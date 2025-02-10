import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../configs/firebaseConfig';

const SignIn = () => {
  const navigation = useNavigation();
  const router = useRouter();

  // Hide the header on this screen
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      const msg = 'Please Enter All Details';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('', msg);
      return;
    }
  
    const trimmedEmail = email.trim().toLowerCase();
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const msg = 'Invalid Email Format';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('', msg);
      return;
    }
  
    // Check for Gmail address
    if (!trimmedEmail.endsWith('@gmail.com')) {
      const msg = 'Only Gmail addresses are allowed for sign in.';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('', msg);
      return;
    }
  
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password.trim()
      );
      console.log(userCredential.user);
      router.replace('/components/LoadingPage');
    } catch (error) {
      console.error(error.code, error.message);
      let errorMsg;
      switch (error.code) {
        case 'auth/wrong-password':
          errorMsg = 'Invalid Email or Password';
          break;
        case 'auth/user-not-found':
          errorMsg = 'No account found with this email';
          break;
        case 'auth/invalid-credential':
          errorMsg = 'Invalid credentials provided';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Too many attempts. Try again later.';
          break;
        default:
          errorMsg = error.message;
          break;
      }
      Platform.OS === 'android'
        ? ToastAndroid.show(errorMsg, ToastAndroid.LONG)
        : Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={{ padding: 25, backgroundColor: Colors.WHITE, height: '100%', paddingTop: 40 }}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{ fontFamily: 'outfit-bold', fontSize: 30, color: Colors.PRIMARY, marginTop: 30 }}>
        Let's Sign You In
      </Text>
      <Text style={{ fontFamily: 'outfit', fontSize: 20, color: Colors.GRAY, marginTop: 20 }}>
        Chalo Beta Start Kare Padhai
      </Text>
      <Text style={{ fontFamily: 'outfit', fontSize: 20, color: Colors.GRAY, marginTop: 10 }}>
        Yaad to aa rahi hogi Hmhari..!!
      </Text>
      {/* Email Input */}
      <View style={{ marginTop: 50 }}>
        <Text style={{ fontFamily: 'outfit' }}>Email</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#888"

          placeholder="Enter Email"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password Input */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: 'outfit' }}>Password</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#888"

          placeholder="Enter Password"
          secureTextEntry
          onChangeText={setPassword}
        />
      </View>

      {/* Sign In Button with Loading Indicator */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => router.replace('auth/sign-up')}
      >
        <Text style={styles.outlineButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 25,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'outfit',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    fontFamily: 'outfit',
  },
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 15,
    marginTop: 50
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: 'center',
  },
  outlineButton: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit',
    textAlign: 'center',
  },
});

export default SignIn;
