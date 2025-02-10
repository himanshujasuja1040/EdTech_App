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
  ScrollView
} from 'react-native';
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
  const [userPhoneNumber, setUserPhoneNumber] = useState(null);
  const [userParentPhoneNumber, setUserParentPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectedStandard, setSelectedStandard } = useContext(AuthContext);

  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const onCreateAccounts = async () => {
    // Check required fields
    if (!email.trim() || !fullName.trim() || !password.trim()) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please Enter All Details', ToastAndroid.LONG);
      } else {
        Alert.alert('', 'Please Enter All Details');
      }
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid Email Format', ToastAndroid.LONG);
      } else {
        Alert.alert('', 'Invalid Email Format');
      }
      return;
    }

    // Validate phone numbers (must be exactly 10 digits)
    if (!userPhoneNumber || !/^\d{10}$/.test(userPhoneNumber.trim())) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid phone number. It must be exactly 10 digits.', ToastAndroid.LONG);
      } else {
        Alert.alert('Invalid Phone Number', 'Your contact detail must be exactly 10 digits.');
      }
      return;
    }
    if (!userParentPhoneNumber || !/^\d{10}$/.test(userParentPhoneNumber.trim())) {
      if (Platform.OS === 'android') {
        ToastAndroid.show("Invalid parent's phone number. It must be exactly 10 digits.", ToastAndroid.LONG);
      } else {
        Alert.alert("Invalid Parent's Phone Number", "Your parent's contact detail must be exactly 10 digits.");
      }
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );
      const user = userCredential.user;
      // Save additional user data in Firestore with accessGranted set to false by default
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email: user.email,
        selectedStandard,
        accessGranted: false,
        createdAt: new Date(), // Timestamp
        userPhoneNumber: userPhoneNumber,
        userParentPhoneNumber: userParentPhoneNumber,
      });
      console.log('User data saved:', {
        fullName,
        email: user.email,
        selectedStandard,
        accessGranted: false,
        userPhoneNumber: userPhoneNumber,
        userParentPhoneNumber: userParentPhoneNumber,
      });
      router.replace('/components/LoadingPage');
    } catch (error) {
      console.error(error.code, error.message);
      ToastAndroid.show(error.message, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
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
    <View style={styles.containerWrapper}>
      <ScrollView style={styles.container}>
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
          />
        </View>

        {/* User Parent's Phone Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Parents Contact Detail</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Parents Phone Number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            onChangeText={setUserParentPhoneNumber}
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

      {/* Full-Screen Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    position: 'relative', // Ensures the overlay is positioned relative to the parent
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 25,
    paddingTop: 50,
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
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensures the overlay is above other content
  },
});

export default SignUP;
