import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';

const Login = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  // Determine orientation and image sizing.
  const isPortrait = useMemo(() => height >= width, [height, width]);
  const portraitImageHeight = useMemo(() => height * 0.6, [height]);

  // State for loading, error, and user data presence.
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserData, setHasUserData] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Hide the header on mount.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Check AsyncStorage for user data on mount (but do not auto-navigate).
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setHasUserData(true);
        } else {
          setHasUserData(false);
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
        setErrorMsg('Error retrieving user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Prevent hardware back button action.
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // On clicking "Get Started", navigate based on the presence of user data.
  const handleGetStarted = useCallback(() => {
    // Ensure the router is available
    if (!router) {
      console.error('Router is not available.');
      return;
    }
  
    // Strictly check that hasUserData is a boolean
    if (hasUserData === true) {
      router.replace('/components/LoadingPage');
    } else if (hasUserData === false) {
      router.push('/auth/sign-in'); // Consistent use of leading slash
    } else {
      // This branch should not be reached if hasUserData is always a boolean.
      console.error('Unexpected value for hasUserData:', hasUserData);
    }
  }, [hasUserData, router]);
  


  // Display a loading spinner while checking login status.
  // if (isLoading) {
  //   return (
  //     <SafeAreaView style={[styles.container, styles.centerContainer]}>
  //       <ActivityIndicator size="large" color={Colors.PRIMARY} />
  //       <Text style={{ marginTop: 10 }}>Checking login status...</Text>
  //     </SafeAreaView>
  //   );
  // }

  // Render layout based on orientation.
  if (isPortrait) {
    // Portrait layout: image on top, content below.
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require("../../assets/images/image4.jpg")}
          style={[styles.image, { height: portraitImageHeight }]}
        />
        <View style={[styles.contentContainer, { paddingHorizontal: width * 0.05 }]}>
          <Text style={styles.title}>ABHISHEK BHAIYA CLASSES</Text>
          <Text style={styles.description}>Radhe Radhe Bacho ...... !!</Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } else {
    // Landscape layout: image on the left, content on the right.
    return (
      <SafeAreaView style={[styles.container, { flexDirection: 'row' }]}>
        <Image
          source={require("../../assets/images/image4.jpg")}
          style={[styles.image, { width: width * 0.5, height: height }]}
        />
        <View
          style={[
            styles.contentContainer,
            {
              width: width * 0.5,
              paddingHorizontal: width * 0.05,
              marginTop: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 30,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 30,
              justifyContent: 'center',
            },
          ]}
        >
          <Text style={styles.title}>ABHISHEK BHAIYA CLASSES</Text>
          <Text style={styles.description}>Radhe Radhe Bacho ...... !!</Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
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
    marginTop: -15, // Creates an overlapping effect in portrait mode.
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
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
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Wrap the component with React.memo to avoid unnecessary re-renders.
export default React.memo(Login);
