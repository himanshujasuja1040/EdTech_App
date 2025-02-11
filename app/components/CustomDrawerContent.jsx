/**
 * SECURITY CONSIDERATION:
 * AsyncStorage is not a secure storage mechanism for sensitive data (e.g., tokens, personal info).
 * For sensitive information, consider using expo-secure-store or another secure storage solution.
 */

import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import  Colors  from '../../constants/Colors';
import { AuthContext } from '../AuthContext/AuthContext';
import { auth } from '../../configs/firebaseConfig';
import ClassesModule from './ClassesModule';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomDrawerContent = (props) => {

  const {
    selectedStandard,
    notifications,
    userData,
    userParentPhoneNumber,
    userPhoneNumber,
    selectedStandardColor,
  } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  // Get device dimensions and determine orientation.
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  // Logout function with loading state and error feedback.
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              console.log('LOGGED OUT ');
              await auth.signOut();

              // Remove the stored user data from AsyncStorage.
              await AsyncStorage.removeItem('user');

              // Navigate back to the login or home screen.
              router.replace('/');
            } catch (error) {
              console.error('Logout Error:', error);
              setLogoutError(error.message);
              Alert.alert('Logout Error', error.message);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { paddingHorizontal: isPortrait ? 1 : 2 },{backgroundColor:selectedStandardColor}
      ]}
    >
      <DrawerContentScrollView {...props}>
        <View style={styles.quickActions}>
          <Text style={{ color: '#fff', fontFamily: 'outfit' }}>
            RADHE RADHE
          </Text>
        </View>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Text style={styles.userName}>
            {userData ? userData.fullName : 'John'}
          </Text>
          <Text style={styles.userEmail}>
            Email: {userData ? userData.email : 'john@example.com'}
          </Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                Your Contact: {userPhoneNumber}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                Parent's Contact: {userParentPhoneNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/components/Notification')}
          >
            <Ionicons name="notifications" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifications.length}</Text>
            </View>
            <Text style={{ color: '#fff', marginTop: 4 }}>
              Notification
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/components/Schedule')}
          >
            <MaterialIcons name="calendar-today" size={24} color="#fff" />
            <Text style={{ color: '#fff', marginTop: 4 }}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/subscreens/AssigmentNote')}
          >
            <Ionicons name="document-text" size={24} color="#fff" />
            <Text style={{ color: '#fff', marginTop: 4 }}>Material</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/components/CategorySelection')}
        >
          <Text style={styles.standardButton}>
            Standard - {selectedStandard ? selectedStandard : 'Select'}
          </Text>
        </TouchableOpacity>

        {/* Classes Module */}
        <ClassesModule />

        {/* Additional Menu Items */}
        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome name="power-off" size={20} color="#fff" />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>
        {logoutError ? (
          <Text style={styles.errorText}>Error: {logoutError}</Text>
        ) : null}
        <Text style={styles.versionText}>Abhishek Bhaiya Classes</Text>
        <Text style={styles.versionText}>Contact: 9268012970</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  profileContainer: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginBottom: 2,
  },
  profileStats: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  statItem: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 13,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  actionButton: {
    padding: 10,
    position: 'relative',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: 20,
    top: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  standardButton: {
    backgroundColor: Colors.PRIMARY,
    color: Colors.WHITE,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    fontFamily: 'outfit',
  },
  menuContainer: {
    marginTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A4D69',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: '500',
  },
  versionText: {
    fontFamily: 'outfit',
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default CustomDrawerContent;
