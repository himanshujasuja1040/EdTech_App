import React, { useContext } from 'react';
import { View, TouchableOpacity, TextInput,Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { router, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons'; // Added missing import
import CustomDrawerContent from '../components/CustomDrawerContent';
import MyZone from './myZone';
import { AuthContext } from '../AuthContext/AuthContext';
// Define your Tab screens as a separate component.
function TabScreens() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color }) => <MaterialIcons name="live-tv" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="myZone"
        options={{
          title: 'MyZone',
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doubts"
        options={{
          title: 'Doubts',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={30} color={color} />,
        }}
      />
    </Tabs>
  );
}

// Create a Drawer Navigator to wrap the Tabs.
const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  const {notifications} =useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        header: ({ navigation }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              height: 60,
              backgroundColor: '#fff',
              elevation: 4, // For Android shadow
              shadowColor: '#000', // For iOS shadow
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          >
            {/* Side Bar Button */}
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => navigation.toggleDrawer()}
            >
              <Ionicons name="reorder-three" size={34} color="black" />
            </TouchableOpacity>

            {/* Enlarged Search Bar */}
            <TextInput
              placeholder="Search..."
              style={{
                fontFamily: 'outfit',
                backgroundColor: '#f0f0f0',
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderRadius: 15,
                flex: 1,
                marginHorizontal: 10,
                fontSize: 16,
              }}
            />

            {/* Notification Button */}
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => {
                router.push('/components/Notification');
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="black" />
              <View style={{
                position: 'absolute',
                right: -5,
                top: -5,
                backgroundColor: 'red',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 12,
                }}>{notifications.length}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabScreens}
        options={{
          drawerLabel: 'Home', 
          drawerIcon: ({ color }) => <FontAwesome name="home" size={30} color={color} />,
        }}
      />
      {/* Add more drawer screens here if needed */}
    </Drawer.Navigator>
  );
}
