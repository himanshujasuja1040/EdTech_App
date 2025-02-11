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

const SignIn = () => {
  // const Colors={
  //   WHITE: '#fff',
  //   PRIMARY: '#000',
  //   GRAY: '#7d7d7d',
  //   LIGHT_GRAY: '#f0f0f0',
  // }
  const navigation = useNavigation();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

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
    <SafeAreaView
      style={[
        styles.container,
        !isPortrait && styles.containerLandscape, // Adjust padding for landscape if needed
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Let's Sign You In</Text>
        <Text style={styles.subtitle}>Chalo Beta Start Kare Padhai</Text>
        <Text style={styles.subtitleSecondary}>Yaad to aa rahi hogi Hmhari..!!</Text>

        {/* Email Input */}
        <View style={styles.emailInputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#888"
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#888"
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
    // paddingTop: 20,
  },
  containerLandscape: {
    // Increase horizontal padding for landscape mode
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
  emailInputWrapper: {
    marginTop: 50,
  },
  inputWrapper: {
    marginTop: 20,
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
