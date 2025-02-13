import { router, useNavigation } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ClassesModule from '../components/ClassesModule';
import { AuthContext } from '../AuthContext/AuthContext';

/**
 * ErrorBoundary is a React class component that catches JavaScript errors
 * anywhere in its child component tree, logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Update state so the next render shows the fallback UI.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log the error (you might also log to an error reporting service)
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong: {this.state.error ? this.state.error.toString() : 'Unknown error'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const MyZone = () => {
  try {
    // Retrieve navigation (wrapped in try/catch)
    let navigation;
    try {
      navigation = useNavigation();
    } catch (error) {
      console.error('Error retrieving navigation:', error);
      // Optionally, you might return early or display a fallback UI here.
    }

    // Retrieve context values (with error handling)
    let authContext;
    try {
      authContext = useContext(AuthContext);
    } catch (error) {
      console.error('Error retrieving AuthContext:', error);
      authContext = {};
    }
    const { userData, selectedStandardColor } = authContext || {};

    // Get window dimensions for dynamic styling
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width;
    const containerDynamicStyle = {
      paddingHorizontal: isPortrait ? 16 : 32,
    };

    // Set navigation options safely
    useEffect(() => {
      try {
        navigation && navigation.setOptions({
          title: 'MyZone',
          headerShown: false,
        });
      } catch (error) {
        console.error('Error setting navigation options:', error);
      }
    }, [navigation]);

    // Fallback student data
    const studentData = {
      name: 'Rahul Sharma',
      class: '10th Grade',
    };

    // Determine which data to display
    const displayData = userData
      ? {
          name: userData.fullName?userData.fullName:'John',
          class: userData.selectedStandard?userData.selectedStandard:'12th Class',
          userPhoneNumber: userData.userPhoneNumber?userData.userPhoneNumber:'0000000000',
          userParentPhoneNumber: userData.userParentPhoneNumber?userData.userParentPhoneNumber:'0000000000',
        }
      : studentData;

    // Helper function to safely navigate
    const safeRouterPush = (route) => {
      try {
        router.push(route);
      } catch (error) {
        console.error(`Error navigating to ${route}:`, error);
      }
    };

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: selectedStandardColor || '#fff' }]}>
        <ScrollView style={[styles.container, containerDynamicStyle]}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle-outline" size={60} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayData.name}</Text>
              <Text style={styles.class}>{displayData.class}</Text>
              {displayData.userPhoneNumber && (
                <Text style={styles.subText}>Phone: {displayData.userPhoneNumber}</Text>
              )}
              {displayData.userParentPhoneNumber && (
                <Text style={styles.subText}>Parent: {displayData.userParentPhoneNumber}</Text>
              )}
            </View>
          </View>

 

          {/* Quick Access Cards */}
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.card} onPress={() => safeRouterPush('/components/Schedule')}>
              <MaterialIcons name="schedule" size={32} color="#2A4D69" />
              <Text style={styles.cardText}>Class Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => safeRouterPush('/subscreens/AssigmentNote')}>
              <Ionicons name="book" size={32} color="#2A4D69" />
              <Text style={styles.cardText}>Study Materials</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Study Tip Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Study Tip</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                Radhe Radhe Baccho, Parents ko proud feel krana hai – isse badiya koi tip hi nahi!
              </Text>
            </View>
          </View>

          {/* Upcoming Classes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Classes</Text>
            {/* Wrap ClassesModule with ErrorBoundary in case it fails */}
            <ErrorBoundary>
              <ClassesModule />
            </ErrorBoundary>
          </View>

          {/* Bottom Button Row */}
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconCard} onPress={() => safeRouterPush('/components/Profile')}>
              <Ionicons name="settings" size={24} color="#2A4D69" />
              <Text style={styles.iconText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCard} onPress={() => safeRouterPush('/components/Attendance')}>
              <Ionicons name="book" size={24} color="#2A4D69" />
              <Text style={styles.iconText}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCard} onPress={() => safeRouterPush('/components/Schedule')}>
              <Ionicons name="time" size={24} color="#2A4D69" />
              <Text style={styles.iconText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } catch (error) {
    // If any synchronous error occurs during rendering, log it and display a fallback UI.
    console.error('Error rendering MyZone component:', error);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>An unexpected error occurred: {error.message}</Text>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  profileHeader: {
    fontFamily: 'outfit',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    backgroundColor: '#2A4D69',
    padding: 6,
    borderRadius: 50,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'outfit',
    fontSize: 22,
    fontWeight: '700',
    color: '#2A4D69',
  },
  class: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: '#555',
    marginVertical: 2,
  },
  subText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#777',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A4D69',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    marginLeft: 25,
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2A4D69',
  },
  progressLabel: {
    fontSize: 16,
    color: '#777',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A4D69',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    marginTop: 8,
    color: '#2A4D69',
    fontWeight: '600',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#F3F8FF',
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 16,
    color: '#2A4D69',
    lineHeight: 22,
    fontFamily: 'outfit',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCard: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A4D69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  iconText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2A4D69',
    fontWeight: '600',
  },
});

// Wrap the exported component in ErrorBoundary to catch any errors in the component tree.
export default () => (
  <ErrorBoundary>
    <MyZone />
  </ErrorBoundary>
);
