import React, { useEffect, useMemo, useCallback, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { router, useNavigation } from 'expo-router';
import { AuthContext } from '../AuthContext/AuthContext';

// A simple loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const Home = () => {
  const { selectedStandard, name, userData } = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();

  // Hide the header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  // --- Memoize static data objects ---
  const commonItems = useMemo(() => [
    { title: 'Premium Courses', icon: '📘' },
    { title: 'Books', icon: '📚' },
    { title: 'Free Lectures', icon: '🎥' },
    { title: 'Free Tests', icon: '📝' },
    { title: 'Assignment & Notes', icon: '🗒️' },
    { title: 'Previous Years Paper', icon: '📄' },
    { title: 'Experiments Videos', icon: '🧪' },
    { title: 'Quiz', icon: '❓' },

  ], []);

  const courses = useMemo(() => ({
    '6th Class': commonItems,
    '7th Class': commonItems,
    '8th Class': commonItems,
    '9th Class': commonItems,
    '10th Class': commonItems,
    '11th Class': commonItems,
    '12th Class': commonItems,
    'JEE MAINS': commonItems,
    'NEET': commonItems,
  }), [commonItems]);

  const categoryDbMapping = useMemo(() => ({
    'Premium Courses': 'PremiumCourse',
    'Books': 'Books',
    'Free Lectures': 'FreeLecture',
    'Free Tests': 'FreeTest',
    'Quiz': 'Quiz',
    'Assignment & Notes': 'AssigmentNote',
    'Previous Years Paper': 'PreviousYearPaper',
    'Experiments Videos': 'ExperimentVideo',
  }), []);

  // --- Compute layout values ---
  const containerMaxWidth = 800;
  const containerWidth = Math.min(width, containerMaxWidth);
  const cardWidth = containerWidth * 0.44;
  const iconFontSize = containerWidth * 0.12;
  const cardTitleFontSize = containerWidth * 0.04;
  const greetingFontSize = containerWidth * 0.045;
  const categoryHeadingFontSize = containerWidth * 0.08;

  // --- Memoize the render function for course cards ---
  const renderCourseCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth, paddingVertical: height * 0.02 }]}
      onPress={() => router.push(`/subscreens/${categoryDbMapping[item.title]}`)}
    >
      <Text style={[styles.cardIcon, { fontSize: iconFontSize }]}>{item.icon}</Text>
      <Text style={[styles.cardTitle, { fontSize: cardTitleFontSize }]}>{item.title}</Text>
    </TouchableOpacity>
  ), [cardWidth, height, iconFontSize, cardTitleFontSize, categoryDbMapping]);

  // --- Memoize the main content ---
  const content = useMemo(() => {
    if (!name || !selectedStandard) {
      return <LoadingScreen />;
    }

    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={[styles.container, { width: containerWidth }]}>
          {/* Header */}
          <View style={[styles.headerContainer, { paddingVertical: height * 0.02 }]}>
            <Text style={[styles.greeting, { fontSize: greetingFontSize }]}>
              Radhe Radhe {name}
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
  }, [
    name,
    selectedStandard,
    containerWidth,
    height,
    greetingFontSize,
    categoryHeadingFontSize,
    courses,
    renderCourseCard,
  ]);

  return content;
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;
