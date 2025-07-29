import React, { useContext, useEffect, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { AuthContext } from '../AuthContext/AuthContext';
import Colors from '../../constants/Colors';

const SubjectSelection = () => {
  const navigation = useNavigation();
  const { selectedStandard, selectedSubject, setSelectedSubject,setSelectedTopic } = useContext(AuthContext);

  // Update navigation options immediately.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
    });
  }, [navigation]);

  // If no standard is selected, ask the user to select one first.
  if (!selectedStandard) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Please select your Standard first</Text>
      </SafeAreaView>
    );
  }

  // Mapping subjects based on the selected standard.
  const subjectMapping = {
    "9th Class": [
      { name: 'Mathematics', color: '#e8f5e9' },
      { name: 'Science', color: '#fce4ec' },
      { name: 'Social Science', color: '#e3f2fd'},
    ],
    "10th Class": [
      { name: 'Physics', color: '#e3f2fd' },
      { name: 'Chemistry', color: '#fce4ec' },
      { name: 'Mathematics', color: '#e8f5e9' },
      { name: 'Biology', color: '#fff3e0' },
    ],
    "11th Class": [
      { name: 'Physics', color: '#e3f2fd' },
      { name: 'Chemistry', color: '#fce4ec' },
      { name: 'Mathematics', color: '#e8f5e9' },
      { name: 'Biology', color: '#fff3e0' },
    ],
    "12th Class": [
      { name: 'Physics', color: '#e3f2fd' },
      { name: 'Chemistry', color: '#fce4ec' },
      { name: 'Mathematics', color: '#e8f5e9' },
      { name: 'Biology', color: '#fff3e0' },
    ],
    "JEE MAINS": [
      { name: 'Physics', color: '#e3f2fd' },
      { name: 'Chemistry', color: '#fce4ec' },
      { name: 'Mathematics', color: '#e8f5e9' },
    ],
    "NEET": [
      { name: 'Physics', color: '#e3f2fd' },
      { name: 'Chemistry', color: '#fce4ec' },
      { name: 'Mathematics', color: '#e8f5e9' },
      { name: 'Biology', color: '#fff3e0' },
    ],
  };

  // Get the subjects for the current standard.
  const subjects = subjectMapping[selectedStandard] || [];

   useEffect(() => {
      if (selectedStandard === "6th Class" || selectedStandard === "7th Class"|| selectedStandard === "8th Class") {
        // Quick redirect to home; no need for topic selection
        setSelectedSubject('');
        setSelectedTopic('');
        router.replace('/(tabs)/home');
      }
    }, [selectedStandard]);
  // Handle subject selection.
  const handleSelect = (subject) => {
    setSelectedSubject(subject.name);
    console.log("In Subject Selection:", subject.name);
    router.push('/components/TopicSelection', { subject: subject.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Choose Your Subject for {selectedStandard}</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.name}
            style={[
              styles.card,
              { backgroundColor: subject.color },
              selectedSubject === subject.name && styles.selectedCard,
            ]}
            onPress={() => handleSelect(subject)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardTitle}>{subject.name}</Text>
            <Ionicons name="book" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.WHITE },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  selectedCard: { borderColor: Colors.PRIMARY, borderWidth: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
});

export default SubjectSelection;
