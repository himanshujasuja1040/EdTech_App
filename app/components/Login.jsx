import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

const Login = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  // Scale function to adjust sizes based on device width.
  const scale = (size) => (width / 375) * size;

  // Determine orientation.
  const isPortrait = useMemo(() => height >= width, [height, width]);
  const portraitImageHeight = useMemo(() => height * 0.6, [height]);

  // States for loading, user data, and error message.
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserData, setHasUserData] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Animations.
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const logoScale = useMemo(() => new Animated.Value(0.8), []);

  // Hide the header.
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Check AsyncStorage for user data.
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const user = await AsyncStorage.getItem('user');
        setHasUserData(!!user);
      } catch (error) {
        console.error('Error retrieving user data:', error);
        setErrorMsg('Error retrieving user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Prevent hardware back button.
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Run fade and bounce animations in parallel.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, logoScale]);

  // Handle "Get Started" navigation.
  const handleGetStarted = useCallback(() => {
    if (!router) {
      console.error('Router is not available.');
      return;
    }
    if (hasUserData) {
      router.replace('/components/LoadingPage');
    } else {
      router.push('/auth/sign-in');
    }
  }, [hasUserData, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </SafeAreaView>
    );
  }

  // Common animated content.
  const Content = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <Text style={[styles.title, { fontSize: scale(30) }]}>
        ABHISHEK BHAIYA CLASSES
      </Text>
      <Text style={[styles.description, { fontSize: scale(18) }]}>
        Radhe Radhe Bacho ...... !!
      </Text>
      {errorMsg && <Text style={[styles.errorText, { fontSize: scale(16) }]}>{errorMsg}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
        <Text style={[styles.buttonText, { fontSize: scale(18) }]}>Get Started</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render layout based on orientation.
  if (isPortrait) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LinearGradient colors={['#a8a9ad', '#243b55']} style={styles.gradient}>
          <View style={styles.imageWrapper}>
            <Animated.Image
              source={require('../../assets/images/profilePhoto.png')}
              style={[
                styles.image,
                { height: portraitImageHeight, transform: [{ scale: logoScale }] },
              ]}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.contentWrapper, { paddingHorizontal: width * 0.05 }]}>
            <Content />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LinearGradient colors={['#141e30', '#243b55']} style={styles.gradientLandscape}>
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Animated.Image
                source={require('../../assets/images/profilePhoto.png')}
                style={[styles.image, { transform: [{ scale: logoScale }] }]}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.contentWrapperLandscape}>
            <Content />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientLandscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
  },
  image: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: { flex: 1, width: '100%' },
  contentWrapperLandscape: { flex: 1, width: '50%', paddingHorizontal: 20 },
  contentContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    fontFamily: 'outfit-bold',
  },
  description: {
    textAlign: 'center',
    color: '#555',
    marginTop: 10,
    width: '90%',
    lineHeight: 26,
    fontFamily: 'outfit',
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: '10%',
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default React.memo(Login);
