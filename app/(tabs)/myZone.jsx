import { router, useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
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
import { ProgressChart } from 'react-native-chart-kit';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import Entypo from '@expo/vector-icons/Entypo';
import ClassesModule from '../components/ClassesModule';
import { AuthContext } from '../AuthContext/AuthContext';

const MyZone = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { overallProgress, selectedStandardColor } = useContext(AuthContext);

  // Get current dimensions to support responsive design.
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  // Increase horizontal padding in landscape mode.
  const containerDynamicStyle = {
    paddingHorizontal: isPortrait ? 16 : 32,
  };

  // Compute a dynamic progress chart size (max 150).
  const progressChartSize = Math.min(width * 0.4, 150);

  // Hide header on this screen.
  useEffect(() => {
    navigation.setOptions({
      title: 'MyZone',
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fallback data and mapping
  const studentData = {
    name: "Rahul Sharma",
    class: "10th Grade",
    overallProgress: overallProgress ? overallProgress : 0.80, // e.g., 0.80 for 80% progress
  };

  const displayData = userData
    ? {
        name: userData.fullName,
        class: userData.selectedStandard,
        overallProgress: overallProgress ? overallProgress : 0.80,
        userPhoneNumber: userData.userPhoneNumber,
        userParentPhoneNumber: userData.userParentPhoneNumber,
      }
    : studentData;

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(42, 77, 105, ${opacity})`,
    strokeWidth: 2,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: selectedStandardColor }]}>
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

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.progressContainer}>
            <ProgressChart
              data={{ data: [displayData.overallProgress] }}
              width={progressChartSize}
              height={progressChartSize}
              strokeWidth={12}
              radius={50}
              chartConfig={chartConfig}
              hideLegend
            />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressPercent}>
                {Math.floor(displayData.overallProgress * 100)}%
              </Text>
              <Text style={styles.progressLabel}>Overall Progress</Text>
            </View>
          </View>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/components/Schedule')}>
            <MaterialIcons name="schedule" size={32} color="#2A4D69" />
            <Text style={styles.cardText}>Class Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/subscreens/AssigmentNote')}>
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
          <ClassesModule />
        </View>

        {/* Bottom Button Row */}
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconCard} onPress={() => router.push("/components/Profile")}>
            <Ionicons name="settings" size={24} color="#2A4D69" />
            <Text style={styles.iconText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCard} onPress={() => router.push("/components/Attendance")}>
            <Entypo name="new-message" size={24} color="#2A4D69" />
            <Text style={styles.iconText}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCard} onPress={() => router.push("/components/Schedule")}>
            <Ionicons name="time" size={24} color="#2A4D69" />
            <Text style={styles.iconText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
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

export default MyZone;
