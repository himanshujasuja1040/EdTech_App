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
  Alert,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../configs/firebaseConfig';
import Colors from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper: Uniform message display for both Android and iOS
const showMessage = (title, message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert(title, message);
  }
};

// Helper: Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const SignIn = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  // Hide header for this screen
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    // Trim inputs early on
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showMessage('Input Error', 'Please enter all details.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      showMessage('Invalid Email', 'Invalid email format.');
      return;
    }

    // Restrict to Gmail addresses only
    if (!trimmedEmail.endsWith('@gmail.com')) {
      showMessage('Email Domain Error', 'Only Gmail addresses are allowed for sign in.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );
      console.log('User signed in:', userCredential.user);

      // Save user data securely
      try {
        await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
      } catch (storageError) {
        console.error('Failed to save user data:', storageError);
        showMessage('Storage Error', 'Failed to save user data. Please try again later.');
        return; // Exit early if storage fails
      }

      // Navigate to the loading page
      router.replace('/components/LoadingPage');
    } catch (error) {
      console.error(error.code, error.message);
      let errorMsg = '';
      switch (error.code) {
        case 'auth/wrong-password':
          errorMsg = 'Invalid email or password.';
          break;
        case 'auth/user-not-found':
          errorMsg = 'No account found with this email.';
          break;
        case 'auth/invalid-credential':
          errorMsg = 'Invalid credentials provided.';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Too many attempts. Try again later.';
          break;
        default:
          errorMsg = error.message;
      }
      showMessage('Sign In Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        !isPortrait && styles.containerLandscape,
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.replace('/components/Login')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Let's Sign You In</Text>
        <Text style={styles.subtitle}>Chalo Beta Start Kare Padhai</Text>
        <Text style={styles.subtitleSecondary}>Yaad to aa rahi hogi Hmhari..!!</Text>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#888"
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
          />
        </View>

        {/* Password Input */}
        <View style={[styles.inputWrapper, { marginTop: 20 }]}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
        </View>

        {/* Sign In Button */}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
  },
  containerLandscape: {
    paddingHorizontal: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 30,
    color: Colors.PRIMARY,
    marginTop: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'outfit',
    fontSize: 20,
    color: Colors.GRAY,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitleSecondary: {
    fontFamily: 'outfit',
    fontSize: 20,
    color: Colors.GRAY,
    marginTop: 10,
    textAlign: 'center',
  },
  inputWrapper: {
    marginTop: 50,
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
    marginTop: 50,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'outfit',
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
