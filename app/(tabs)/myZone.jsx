import { router, useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Image 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
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
  const {overallProgress}=useContext(AuthContext)
  // Hide header on this screen
  useEffect(() => {
    navigation.setOptions({ 
      title:'MyZone',
      headerShown: false 
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



  const studentData = {
    name: "Rahul Sharma",
    class: "10th Grade",
    attendance: "92%",
    overallProgress: overallProgress, // 75% progress
    upcomingClasses: [
      { id: 1, subject: "Mathematics", time: "Mon 4:00 PM", topic: "Algebra" },
      { id: 2, subject: "Physics", time: "Wed 10:00 AM", topic: "Optics" }
    ],
    pendingAssignments: [
      { id: 1, subject: "Chemistry", dueDate: "2023-08-25", title: "Atomic Structure Worksheet" },
      { id: 2, subject: "Biology", dueDate: "2023-08-28", title: "Cell Division Report" }
    ]
  };

  // Dummy announcements data for the tuition center app
  const announcements = [
    { id: 1, title: "New Timetable Released", date: "2023-09-01" },
    { id: 2, title: "Exam Guidelines Updated", date: "2023-09-05" }
  ];

  // Map Firebase keys to your UI expected keys if userData exists
  const displayData = userData
    ? {
        name: userData.fullName,
        class: userData.selectedStandard,
        attendance: studentData.attendance,
        overallProgress: studentData.overallProgress,
        upcomingClasses: studentData.upcomingClasses,
        pendingAssignments: studentData.pendingAssignments,
      }
    : studentData;

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(42, 77, 105, ${opacity})`,
    strokeWidth: 2
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{displayData.name}</Text>
          <Text style={styles.class}>{displayData.class}</Text>
          <View style={styles.attendanceBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.attendanceText}>{displayData.attendance} Attendance</Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Progress</Text>
        <View style={styles.progressContainer}>
          {/* Uncomment and configure ProgressChart if needed */}
          <ProgressChart
            data={{ data: [displayData.overallProgress] }}
            width={150}
            height={150}
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
            Radhe Radhe Baccho , Parents ko Proud feel krana hai , isse badiya koi tip hai hi nahi
          </Text>
        </View>
      </View>

      {/* Upcoming Classes */}
      <View>
      <ClassesModule />
      </View>
      

      {/* Bottom Button Row */}
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconCard} onPress={()=>router.push("/components/Profile")}>
          <Ionicons name="settings" size={24} color={Colors.PRIMARY} />
          <Text style={styles.iconText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={()=>router.push("/components/Attendance")}>
          <Entypo name="new-message" size={24} color={Colors.PRIMARY} />
          <Text style={styles.iconText}>Attendence</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={()=>router.push("/components/Schedule")}>
          <Ionicons name="time" size={24} color={Colors.PRIMARY} />
          <Text style={styles.iconText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  class: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  attendanceText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontSize: 14,
  },
  section: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  seeAll: {
    color: '#4B86B4',
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    color: '#666',
  },
  // Quick access cards (cardRow and card)
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    marginTop: 8,
    color: '#2A4D69',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Class item styles
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  classIcon: {
    backgroundColor: '#e8f1f8',
    padding: 10,
    borderRadius: 8,
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  classSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  classTopic: {
    fontSize: 14,
    color: '#4B86B4',
    marginTop: 2,
  },
  // Assignment item styles
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  assignmentIcon: {
    backgroundColor: '#e8f1f8',
    padding: 10,
    borderRadius: 8,
    marginRight: 16,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentSubject: {
    fontSize: 14,
    color: '#666',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginVertical: 4,
  },
  assignmentDue: {
    fontSize: 14,
    color: '#ff6b6b',
  },
  // Tip card styles
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'outfit-regular',
  },
  // Announcement item styles
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  announcementIcon: {
    backgroundColor: '#e8f1f8',
    padding: 10,
    borderRadius: 8,
    marginRight: 16,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  announcementDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  // Bottom row icon buttons
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
    // paddingHorizontal: 10,
  },
  iconCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,

    // Elevation for Android
    elevation: 1,
  },
  iconText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default MyZone;
