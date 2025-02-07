import React, { useEffect, useState, useContext } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  useWindowDimensions,
  Platform
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { router, useNavigation } from 'expo-router';
import { AuthContext } from '../AuthContext/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';

const Home = () => {
  const { selectedStandard, name } = useContext(AuthContext);
  const { width, height } = useWindowDimensions(); // Get current dimensions
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, []);

  // Common items for all standards
  const commonItems = [
    { title: 'Premium Courses', icon: '📘' },
    { title: 'Books', icon: '📚' },
    { title: 'Free Lectures', icon: '🎥' },
    { title: 'Free Tests', icon: '📝' },
    { title: 'Quiz', icon: '❓' },
    { title: 'Assignment & Notes', icon: '🗒️' },
    { title: 'Previous Years Paper', icon: '📄' },
    { title: 'Experiments Videos', icon: '🧪' },
  ];

  // Map standards to course items
  const courses = {
    '6th Class': commonItems,
    '7th Class': commonItems,
    '8th Class': commonItems,
    '9th Class': commonItems,
    '10th Class': commonItems,
    '11th Class': commonItems,
    '12th Class': commonItems,
    'JEE MAINS': commonItems,
    'NEET': commonItems,
  };

  // Mapping for navigating to subscreens
  const categoryDbMapping = {
    'Premium Courses': 'PremiumCourse',
    'Books': 'Books',
    'Free Lectures': 'FreeLecture',
    'Free Tests': 'FreeTest',
    'Quiz': 'Quiz',
    'Assignment & Notes': 'AssigmentNote',
    'Previous Years Paper': 'PreviousYearPaper',
    'Experiments Videos': 'ExperimentVideo',
  };

  // Limit the container width for large screens (e.g., web/laptop)
  const containerMaxWidth = 800;
  const containerWidth = Math.min(width, containerMaxWidth);

  // Calculate sizes based on the containerWidth instead of full screen width.
  const cardWidth = containerWidth * 0.44;
  const iconFontSize = containerWidth * 0.12;  // You can adjust this multiplier to reduce the icon size further if needed
  const cardTitleFontSize = containerWidth * 0.04;
  const greetingFontSize = containerWidth * 0.045;
  const categoryHeadingFontSize = containerWidth * 0.08;

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth, paddingVertical: height * 0.02 }]} 
      onPress={() => router.push(`/subscreens/${categoryDbMapping[item.title]}`)}
    >
      <Text style={[styles.cardIcon, { fontSize: iconFontSize }]}>{item.icon}</Text>
      <Text style={[styles.cardTitle, { fontSize: cardTitleFontSize }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={[styles.container, { width: containerWidth }]}>
        {/* Header */}
        <View style={[styles.headerContainer, { paddingVertical: height * 0.02 }]}>
          <Text style={[styles.greeting, { fontSize: greetingFontSize }]}>
            Hello {name}
          </Text>
          <Text style={[styles.categoryHeading, { fontSize: categoryHeadingFontSize }]}>
            {selectedStandard}
          </Text>
        </View>

        {/* Course Cards */}
        <FlatList
          data={courses[selectedStandard] || []}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.title}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: height * 0.15 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    // Center the container for larger screens and web
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  headerContainer: {
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    backgroundColor: Colors.WHITE,
  },
  greeting: {
    fontFamily: 'outfit-medium',
    fontWeight: '600',
  },
  categoryHeading: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  row: {
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  cardIcon: {
    marginBottom: 5,
  },
  cardTitle: {
    fontFamily: 'outfit-medium',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Home;
