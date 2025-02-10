import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { AuthContext } from '../AuthContext/AuthContext';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import ClassesModule from './ClassesModule';

const CustomDrawerContent = (props) => {
  const { selectedStandard ,notifications,userData,userParentPhoneNumber,userPhoneNumber} = useContext(AuthContext);


  // Quick logout function
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
              await auth.signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert('Logout Error', error.message);
            }
          },
        },
      ]
    );
  };



  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.quickActions}>
          <Text style={{ color: '#fff', fontFamily:'outfit' }}>RADHE RADHE </Text>
        </View>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Text style={styles.userName}>
            {userData ? userData.fullName : 'John'}
          </Text>
          <Text style={styles.userEmail}>
            Email : {userData ? userData.email : 'john@example.com'}
          </Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Your Contact : {userPhoneNumber}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Parent's Contact : {userParentPhoneNumber}</Text>
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
            <Text style={{ color: '#fff', marginTop: 4 }}>Notification</Text>
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
          <Text
            style={{
              backgroundColor: Colors.PRIMARY,
              color: Colors.WHITE,
              textAlign: 'center',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 10,
              fontFamily: 'outfit',
            }}
          >
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="power-off" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Abhisekh Bhaiya Classes</Text>
        <Text style={styles.versionText}>Contact : 9268012970</Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  profileContainer: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    marginTop:15,
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
    flexDirection: 'col',
    justifyContent: 'space-around',
  },
  statValue: {
    fontSize: 14,
    marginBottom: 2,
    color: Colors.PRIMARY,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 13,
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
    fontFamily:'outfit',
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  // Additional styles for DrawerItemList can be added here if needed.
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomDrawerContent;
