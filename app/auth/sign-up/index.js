import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, db } from '../../../configs/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, GeoPoint } from 'firebase/firestore';
import CustomDropdown from '../../components/CustomDropdown';
import { AuthContext } from '../../AuthContext/AuthContext';
import Colors from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper: Display messages uniformly for Android and iOS.
const showMessage = (title, message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert(title, message);
  }
};

// Helper: Email format validation.
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper: Phone number must be exactly 10 digits.
const validatePhoneNumber = (phone) => /^\d{10}$/.test(phone.trim());

const SignUP = () => {
  // State variables for input fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userParentPhoneNumber, setUserParentPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedStandard, setSelectedStandard } = useContext(AuthContext);

  const router = useRouter();
  const navigation = useNavigation();

  // Orientation handling.
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const onCreateAccounts = async () => {
    // Trim inputs for consistency.
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedFullName = fullName.trim();
    const trimmedUserPhone = userPhoneNumber.trim();
    const trimmedParentPhone = userParentPhoneNumber.trim();

    // Validate required fields.
    if (!trimmedEmail || !trimmedFullName || !trimmedPassword) {
      showMessage('Input Error', 'Please enter all details.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      showMessage('Invalid Email', 'Invalid email format.');
      return;
    }

    if (!validatePhoneNumber(trimmedUserPhone)) {
      showMessage('Invalid Phone Number', 'Your contact detail must be exactly 10 digits.');
      return;
    }

    if (!validatePhoneNumber(trimmedParentPhone)) {
      showMessage("Invalid Parent's Phone Number", "Your parent's contact detail must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      // Create account with Firebase Authentication.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );
      const user = userCredential.user;

      // Save additional user data in Firestore.
      await setDoc(doc(db, 'users', user.uid), {
        fullName: trimmedFullName,
        email: user.email,
        selectedStandard,
        accessGranted: false,
        createdAt: new Date(),
        userPhoneNumber: trimmedUserPhone,
        userParentPhoneNumber: trimmedParentPhone,
        location: new GeoPoint(0, 0),
      });

      // Store user data locally.
      await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));

      // Navigate to the loading page.
      router.replace('/components/LoadingPage');
    } catch (error) {
      console.error('SignUp Error:', error.code, error.message);
      showMessage('Sign Up Error', error.code);
    } finally {
      setLoading(false);
    }
  };

  // Options for the standard dropdown.
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
    <SafeAreaView style={[styles.containerWrapper, !isPortrait && styles.containerLandscape]}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.heading}>Create New Account</Text>

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              placeholderTextColor="#888"
              onChangeText={setFullName}
              value={fullName}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              placeholderTextColor="#888"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
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

          {/* Standard Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Standard</Text>
            <CustomDropdown
              options={standardOptions}
              placeholder="Select"
              selectedValue={selectedStandard}
              onValueChange={setSelectedStandard}
            />
          </View>

          {/* User Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Contact Detail</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              onChangeText={setUserPhoneNumber}
              value={userPhoneNumber}
            />
          </View>

          {/* Parent's Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Parents Contact Detail</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Parents Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              onChangeText={setUserParentPhoneNumber}
              value={userParentPhoneNumber}
            />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onCreateAccounts}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Sign In */}
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.replace('auth/sign-in')}
          >
            <Text style={styles.outlineButtonText}>Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full-Screen Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  containerWrapper: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    position: 'relative', // Needed for the loading overlay.
  },
  containerLandscape: {
    paddingHorizontal: 50,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 25,
    paddingTop: 50,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 20,
  },
  heading: {
    fontFamily: 'outfit-bold',
    fontSize: 30,
    marginBottom: 30,
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
    marginTop: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit',
    textAlign: 'center',
  },
  outlineButton: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom:100,
  },
  outlineButtonText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent overlay.
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default SignUP;
