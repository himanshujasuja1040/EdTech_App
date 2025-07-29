import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Make sure to install expo-linear-gradient
import Ionicons from '@expo/vector-icons/Ionicons';

const NoAccess = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  const [accessGranted, setAccessGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hide header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Parse access status from URL params
  useEffect(() => {
    const parseAccessStatus = () => {
      try {
        if (!searchParams.userDataFromLP) {
          setIsLoading(false);
          return;
        }
        const data =
          typeof searchParams.userDataFromLP === 'string'
            ? JSON.parse(searchParams.userDataFromLP)
            : searchParams.userDataFromLP;
        setAccessGranted(data.accessGranted ?? false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setAccessGranted(false);
      } finally {
        setIsLoading(false);
      }
    };

    parseAccessStatus();
  }, [searchParams.userDataFromLP]);

  // Handle redirection logic when access is granted
  useEffect(() => {
    if (accessGranted) {
      router.replace({
        pathname: '/(tabs)/home',
        params: { _href: '/(tabs)/home' },
      });
    }
  }, [accessGranted]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Gradient background */}
      <LinearGradient
        colors={['#2A4D69', '#4F709C']}
        style={styles.gradientBackground}
      >
        <View
          style={[
            styles.cardContainer,
            isPortrait ? styles.cardPortrait : styles.cardLandscape,
          ]}
        >
          <Ionicons name="alert-circle-outline" size={64} color="#000" />
          <Text style={styles.title}>Access Pending</Text>
          <Text style={styles.message}>
            Radhe Radhe Beta , Abhi Verification Pending hai 
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/auth/sign-in')}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2A4D69', // fallback color in case gradient doesn't load
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '85%',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPortrait: {
    marginHorizontal: 20,
  },
  cardLandscape: {
    width: '60%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2A4D69',
    marginTop: 15,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2A4D69',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NoAccess;