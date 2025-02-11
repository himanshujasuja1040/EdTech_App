// import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Colors  from '../../constants/Colors';

const Login = () => {
  const router = useRouter();
  // const Colors={
  //   WHITE: '#fff',
  //   PRIMARY: '#000',
  //   GRAY: '#7d7d7d',
  //   LIGHT_GRAY: '#f0f0f0',
  // }
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  // For portrait mode, the image height is set to 60% of the screen height.
  const portraitImageHeight = height * 0.6;

  // Local states for loading and error handling.
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Hide the header.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Auto Login Check: if user data is found in AsyncStorage, navigate to the Main Page.
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const user = await AsyncStorage.getItem('user');
        if (user) {
          router.replace('/components/LoadingPage');
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
        setErrorMsg('Error retrieving user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  // While checking the login status, display a loading indicator.
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={{ marginTop: 10 }}>Checking login status...</Text>
      </SafeAreaView>
    );
  }

  // Render layout based on the orientation.
  if (isPortrait) {
    // Portrait Layout: Image on top, content below.
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require("../../assets/images/image4.jpg")}
          style={[styles.image, { height: portraitImageHeight }]}
        />
        <View style={[styles.contentContainer, { paddingHorizontal: width * 0.05 }]}>
          <Text style={styles.title}>ABHISHEK BHAIYA CLASSES</Text>
          <Text style={styles.description}>
            Radhe Radhe Bacho ...... !!
          </Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('auth/sign-in')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } else {
    // Landscape Layout: Horizontal layout with image on the left and content on the right.
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
              // Remove the top border radii since the layout is horizontal.
              borderTopLeftRadius: 0,
              borderTopRightRadius: 30,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 30,
              justifyContent: 'center',
            },
          ]}
        >
          <Text style={styles.title}>ABHISHEK BHAIYA CLASSES</Text>
          <Text style={styles.description}>
            Radhe Radhe Bacho ...... !!
          </Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('auth/sign-in')}
          >
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
    // For portrait, a slight negative margin creates an overlapping effect.
    marginTop: -15,
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

export default Login;
