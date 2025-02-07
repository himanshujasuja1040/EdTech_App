import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext/AuthContext';
const CategorySelection = () => {
  const navigation = useNavigation();
  const { selectedStandard, setSelectedStandard } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  console.log(selectedStandard);
  useEffect(() => {
    navigation.setOptions({
      title: "Choose Your Category",
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
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {/* Enlarged Search Bar */}
          <Text style={{ fontFamily: 'outfit-bold', fontSize: 20 }}>Choose Your Category</Text>

          {/* Notification Button */}
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => {
              console.log('Notification pressed');
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )
    })
  }, [navigation])

  const categories = [
    { name: 'JEE MAINS', level: 'Competitive', value: 'JEE MAINS' },
    { name: 'NEET', level: 'Competitive', value: 'JEE MAINS' },
    { name: '12th Class', level: 'Senior', value: '12th Class' },
    { name: '11th Class', level: 'Senior', value: '11th Class' },
    { name: '10th Class', level: 'Secondary', value: '10th Class' },
    { name: '9th Class', level: 'Secondary', value: '9th Class' },
    { name: '8th Class', level: 'Middle', value: '8th Class' },
    { name: '7th Class', level: 'Middle', value: '7th Class' },
    { name: '6th Class', level: 'Primary', value: '6th Class' },
  ];

  const handleSelect = (category) => {
    setSelectedCategory(category);
  };
  const handleContinue = () => {
    setSelectedStandard(selectedCategory)
    console.log(selectedCategory)
    router.replace("/(tabs)/home")
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <TouchableOpacity style={styles.inputContainer}>
        <Ionicons name="school" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder='Select Standard'
          placeholderTextColor={Colors.GRAY}
        />
      </TouchableOpacity>

      <View style={styles.grid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              selectedCategory === category.name && styles.selectedCard
            ]}
            onPress={() => handleSelect(category.name)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardSubtitle}>{category.level}</Text>
            <View style={[
              styles.levelIndicator,
              { backgroundColor: Colors.PRIMARY + '20' }
            ]}>
              <Ionicons
                name="ribbon"
                size={16}
                color={Colors.PRIMARY}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText} onPress={handleContinue}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
    paddingTop: 12,
  },
  title: {
    backgroundColor: Colors.PRIMARY,
    color: Colors.WHITE,
    fontSize: 20,
    paddingLeft: 17,
    paddingRight: 17,
    paddingTop: 6,
    paddingBottom: 6,

    fontFamily: 'outfit-bold',
    // marginBottom: 10,
    textAlign: 'center',
    borderRadius: 14,
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
    borderWidth: 1
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
    width: '48%',
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    position: 'relative',
  },
  selectedCard: {
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY + '10',
  },
  cardTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.DARK,
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
    // marginTop: 10,
    marginBottom: 20,
    elevation: 3,
  },
  continueButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-semibold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CategorySelection;