import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext/AuthContext';
import Colors from '../../constants/Colors';

const CategorySelection = () => {
  const navigation = useNavigation();
  const { selectedStandard, setSelectedStandard, setselectedStandardColor } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);


  // If nothing is selected, default to the context’s selectedStandard
  useEffect(() => {
    if (!selectedCategory && selectedStandard) {
      setSelectedCategory(selectedStandard);
    }
  }, [selectedStandard, selectedCategory]);

  useEffect(() => {
    navigation.setOptions({
      title: "Choose Your Category",
      header: ({ navigation }) => (
        <View style={styles.headerContainer}>
          {/* Side Bar Button */}
          <TouchableOpacity style={{ padding: 5 }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {/* Enlarged Search Bar */}
          <Text style={styles.headerTitle}>Choose Your Category</Text>

          {/* Notification Button */}
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => console.log('Notification pressed')}
          >
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Category list
  const categories = [
    { name: 'JEE MAINS', level: 'Competitive', value: 'JEE MAINS' },
    { name: 'NEET', level: 'Competitive', value: 'NEET' },
    { name: '12th Class', level: 'Senior', value: '12th Class' },
    { name: '11th Class', level: 'Senior', value: '11th Class' },
    { name: '10th Class', level: 'Secondary', value: '10th Class' },
    { name: '9th Class', level: 'Secondary', value: '9th Class' },
    { name: '8th Class', level: 'Middle', value: '8th Class' },
    { name: '7th Class', level: 'Middle', value: '7th Class' },
    { name: '6th Class', level: 'Primary', value: '6th Class' },
  ];

  // Mapping each category to a light background color
  const categoryColors = {
    'JEE MAINS': '#fce4ec', // light pink
    'NEET': '#e3f2fd',      // light blue
    '12th Class': '#e8f5e9', // light green
    '11th Class': '#fff3e0', // light orange
    '10th Class': '#ede7f6', // light purple
    '9th Class': '#f3e5f5',  // light violet
    '8th Class': '#e0f7fa',  // light cyan
    '7th Class': '#fbe9e7',  // light red-orange
    '6th Class': '#f1f8e9',  // light greenish-yellow
  };

  // Get window dimensions and determine orientation
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  // Use 48% width for cards in portrait and 31% for landscape (approximately 2 vs. 3 per row)
  const cardWidth = isPortrait ? '48%' : '31%';

  // Updated handleSelect: now accepts the whole category object.
  const handleSelect = (category) => {
    setSelectedCategory(category.name);
    setselectedStandardColor(categoryColors[category.name]);
  };

  const handleContinue = () => {
    setLoading(true);

    // Simulate a delay (e.g., waiting for an async operation)
    setTimeout(() => {
      const categoryToSet = selectedCategory || selectedStandard;
      setSelectedStandard(categoryToSet);
      router.replace("/(tabs)/home");
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.inputContainer}>
          <Ionicons
            name="school"
            size={20}
            color={Colors.PRIMARY}
            style={styles.inputIcon}
          />
          {/* Display the selected category (non-editable) */}
          <TextInput
            style={styles.input}
            placeholder="Select Standard"
            placeholderTextColor="#888"
            editable={false}
            value={selectedCategory || ''}
          />
        </TouchableOpacity>

        <View style={styles.grid}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: selectedCategory === category.name
                    ? Colors.PRIMARY + '10'
                    : categoryColors[category.name] || Colors.WHITE,
                },
                selectedCategory === category.name && styles.selectedCard,
              ]}
              // Pass the entire category object to handleSelect
              onPress={() => handleSelect(category)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle}>{category.name}</Text>
              <Text style={styles.cardSubtitle}>{category.level}</Text>
              <View
                style={[
                  styles.levelIndicator,
                  { backgroundColor: Colors.PRIMARY + '20' },
                ]}
              >
                <Ionicons name="ribbon" size={16} color={Colors.PRIMARY} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
    paddingTop: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 60,
    backgroundColor: '#fff',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 2,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    position: 'relative',
  },
  selectedCard: {
    borderColor: Colors.PRIMARY,
  },
  cardTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'outfit-regular',
    fontSize: 14,
    color: Colors.GRAY,
  },
  levelIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 8,
  },
  continueButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-semibold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CategorySelection;
