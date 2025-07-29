import React, { useContext, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { AuthContext } from '../AuthContext/AuthContext';
import Colors from '../../constants/Colors';

// Topics mapping (static, so you might consider moving this outside the component)
const topics = {
  "9th Class": {
    "Mathematics": [
      "Ch 1: Number Systems",
      "Ch 2: Polynomials",
      "Ch 3: Coordinate Geometry",
      "Ch 4: Linear Equations in Two Variables",
      "Ch 5: Introduction to Euclid’s Geometry",
      "Ch 6: Lines and Angles",
      "Ch 7: Triangles",
      "Ch 8: Quadrilaterals",
      "Ch 9: Areas of Parallelograms and Triangles",
      "Ch 10: Circles",
      "Ch 11: Constructions",
      "Ch 12: Heron’s Formula",
      "Ch 13: Surface Areas and Volumes",
      "Ch 14: Statistics",
      "Ch 15: Probability"
    ],
    "Science": [
      "Ch 1: Matter in Our Surroundings",
      "Ch 2: Is Matter Around Us Pure?",
      "Ch 3: Atoms and Molecules",
      "Ch 4: Structure of the Matter",
      "Ch 5: The Fundamental Unit of Life",
      "Ch 6: Tissues",
      "Ch 7: Diversity in Living Organisms",
      "Ch 8: Why Do We Fall Ill?",
      "Ch 9: Natural Resources",
      "Ch 10: Improvement in Food Resources",
      "Ch 11: Separation of Substances"
    ],
    "Social Science": {
      "History": [
        "Ch 1: The French Revolution",
        "Ch 2: Nazism and the Rise of Hitler",
        "Ch 3: Forest Society and Colonialism",
        "Ch 4: Pastoralists in the Modern World",
        "Ch 5: The Making of a Global World"
      ],
      "Geography": [
        "Ch 1: The Earth – Our Habitat",
        "Ch 2: Inside Our Earth",
        "Ch 3: Natural Vegetation and Wildlife",
        "Ch 4: Natural Resources and Their Conservation",
        "Ch 5: Natural Hazards: Causes and Effects"
      ],
      "Political Science": [
        "Ch 1: What is Democracy? Why Democracy?",
        "Ch 2: The Constitution and the Individual",
        "Ch 3: The Government and the Citizen",
        "Ch 4: Democratic Rights and Duties",
        "Ch 5: Social Diversity and Politics"
      ],
      "Economics": [
        "Ch 1: The Story of Village Palampur",
        "Ch 2: People as a Resource",
        "Ch 3: Poverty as a Challenge",
        "Ch 4: Food Security in India",
        "Ch 5: The Story of Indian Agriculture"
      ]
    }
  },
  '10th Class': {
    'Physics': [
      'Ch 10: Light – Reflection and Refraction',
      'Ch 11: Electricity',
      'Ch 12: Magnetic Effects of Electric Current',
      'Ch 13: Sources of Energy',
    ],
    'Chemistry': [
      'Ch 1: Chemical Reactions and Equations',
      'Ch 2: Acids, Bases and Salts',
      'Ch 3: Metals and Non-metals',
      'Ch 4: Carbon and its Compounds',
      'Ch 5: Periodic Classification of Elements',
    ],
    'Mathematics': [
      'Ch 1: Real Numbers',
      'Ch 2: Polynomials',
      'Ch 3: Pair of Linear Equations in Two Variables',
      'Ch 4: Quadratic Equations',
      'Ch 5: Arithmetic Progressions',
      'Ch 6: Triangles',
      'Ch 7: Coordinate Geometry',
      'Ch 8: Introduction to Trigonometry',
      'Ch 9: Some Applications of Trigonometry',
      'Ch 10: Circles',
      'Ch 11: Constructions',
      'Ch 12: Areas of the Plane Figures',
      'Ch 13: Surface Areas and Volumes',
      'Ch 14: Statistics',
      'Ch 15: Probability',
    ],
    'Biology': [
      'Ch 6: Life Processes',
      'Ch 7: Control and Coordination',
      'Ch 8: How do Organisms Reproduce?',
      'Ch 9: Heredity and Evolution',
    ],
  },
  '11th Class': {
    'Physics': [
      "Ch 1: Units and Measurements",
      "Ch 2: Motion in a Straight Line",
      "Ch 3: Motion in a Plane",
      "Ch 4: Laws of Motion",
      "Ch 5: Work, Energy and Power",
      "Ch 6: System of Particles and Rotational Motion",
      "Ch 7: Gravitation",
      "Ch 8: Mechanical Properties of Solids",
      "Ch 9: Mechanical Properties of Fluids",
      "Ch 10: Thermal Properties of Matter",
      "Ch 11: Thermodynamics",
      "Ch 12: Kinetic Theory",
      "Ch 13: Oscillations",
      "Ch 14: Waves",
    ],
    'Chemistry': [
      "Ch 1: Some Basic Concepts of Chemistry",
      "Ch 2: Structure of Atom",
      "Ch 3: Classification of Elements and Periodicity in Properties",
      "Ch 4: Chemical Bonding and Molecular Structure",
      "Ch 5: States of Matter: Gases and Liquids",
      "Ch 6: Thermodynamics",
      "Ch 7: Equilibrium",
      "Ch 8: Redox Reactions",
      "Ch 9: Hydrogen",
      "Ch 10: s-Block Elements",
      "Ch 11: Some p-Block Elements",
      "Ch 12: Organic Chemistry – Some Basic Principles and Techniques",
      "Ch 13: Hydrocarbons",
      "Ch 14: Environmental Chemistry",
    ],
    'Mathematics': [
      "Ch 1: Sets and Functions",
      "Ch 2: Relations & Functions",
      "Ch 3: Trigonometric Functions",
      "Ch 4: Principle of Mathematical Induction",
      "Ch 5: Complex Numbers and Quadratic Equations",
      "Ch 6: Linear Inequalities",
      "Ch 7: Permutations and Combinations",
      "Ch 8: Binomial Theorem",
      "Ch 9: Sequence and Series",
      "Ch 10: Straight Lines",
      "Ch 11: Conic Sections",
      "Ch 12: Introduction to Three-Dimensional Geometry",
      "Ch 13: Limits and Derivatives",
      "Ch 14: Mathematical Reasoning",
      "Ch 15: Statistics and Probability",
    ],
    'Biology': [
      "Ch 1: The Living World",
      "Ch 2: Biological Classification",
      "Ch 3: Plant Kingdom",
      "Ch 4: Animal Kingdom",
    ],
  },
  '12th Class': {
    'Physics': [
      "Ch 1: Electric Charges and Fields",
      "Ch 2: Electrostatic Potential and Capacitance",
      "Ch 3: Current Electricity",
      "Ch 4: Moving Charges and Magnetism",
      "Ch 5: Magnetism and Matter",
      "Ch 6: Electromagnetic Induction",
      "Ch 7: Alternating Current",
      "Ch 8: Electromagnetic Waves",
      "Ch 9: Optics",
      "Ch 10: Dual Nature of Matter and Radiation",
      "Ch 11: Atoms",
      "Ch 12: Nuclei",
      "Ch 13: Semiconductor Electronics",
      "Ch 14: Communication Systems",
    ],
    'Chemistry': [
      "Ch 1: Solid State",
      "Ch 2: Solutions",
      "Ch 3: Electrochemistry",
      "Ch 4: Chemical Kinetics",
      "Ch 5: Surface Chemistry",
      "Ch 6: General Principles and Processes of Isolation of Elements",
      "Ch 7: p-Block Elements",
      "Ch 8: d- and f-Block Elements",
      "Ch 9: Coordination Compounds",
      "Ch 10: Haloalkanes and Haloarenes",
      "Ch 11: Alcohols, Phenols and Ethers",
      "Ch 12: Aldehydes, Ketones and Carboxylic Acids",
      "Ch 13: Organic Compounds Containing Nitrogen (Amines)",
      "Ch 14: Biomolecules",
      "Ch 15: Polymers",
      "Ch 16: Chemistry in Everyday Life",
    ],
    'Mathematics': [
      "Ch 1: Relations and Functions",
      "Ch 2: Inverse Trigonometric Functions",
      "Ch 3: Matrices",
      "Ch 4: Determinants",
      "Ch 5: Continuity and Differentiability",
      "Ch 6: Application of Derivatives",
      "Ch 7: Integrals",
      "Ch 8: Application of Integrals",
      "Ch 9: Differential Equations",
      "Ch 10: Vector Algebra",
      "Ch 11: Three-Dimensional Geometry",
      "Ch 12: Linear Programming",
      "Ch 13: Probability",
      "Ch 14: Statistics",
    ],
    'Biology': [
      "Ch 1: Reproduction",
      "Ch 2: Genetics and Evolution",
      "Ch 3: Biology and Human Welfare",
      "Ch 4: Biotechnology and its Applications",
      "Ch 5: Ecology and Environment",
    ],
  },
};

const TopicSelection = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { selectedStandard, selectedSubject, selectedTopic, setSelectedTopic } = useContext(AuthContext);

  // For entrance exams like JEE MAINS or NEET, skip topic selection.
  useEffect(() => {
    if (selectedStandard === "JEE MAINS" || selectedStandard === "NEET") {
      // Quick redirect to home; no need for topic selection
      setSelectedTopic('');
      router.replace('/(tabs)/home');
    }
  }, [selectedStandard]);

  // Set the header title right away
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Topic Selection",
    });
  }, [navigation]);

  // Pastel color palette for cards.
  const pastelColors = [
    '#fce4ec', '#e3f2fd', '#e8f5e9', '#ede7f6', 
    '#f3e5f5', '#e0f7fa', '#fbe9e7', '#f1f8e9'
  ];

  // Memoize the topic list.
  const topicList = useMemo(() => {
    // Directly get topics for the selected subject.
    let topicsForSubject = topics[selectedStandard]?.[selectedSubject] || [];
    // If the selected subject is "Social Science", flatten the nested object.
    if (topicsForSubject && typeof topicsForSubject === 'object' && !Array.isArray(topicsForSubject)) {
      topicsForSubject = Object.values(topicsForSubject).flat();
    }
    return topicsForSubject;
  }, [selectedStandard, selectedSubject]);

  const handleContinue = () => {
    if (!selectedTopic) {
      alert('Please select a topic to continue.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.replace('/(tabs)/home');
      setLoading(false);
    }, 1000);
  };

  // If we're redirecting (for JEE MAINS or NEET), render nothing.
  if (selectedStandard === "JEE MAINS" || selectedStandard === "NEET") {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        Choose a Topic for {selectedSubject} in {selectedStandard}
      </Text>
      {topicList.length > 0 ? (
        <ScrollView contentContainerStyle={styles.grid}>
          {topicList.map((topic, index) => (
            <TouchableOpacity
              key={topic} // assuming topic strings are unique
              style={[
                styles.card,
                { backgroundColor: pastelColors[index % pastelColors.length] },
                selectedTopic === topic && styles.selectedCard,
              ]}
              onPress={() => setSelectedTopic(topic)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle}>{topic}</Text>
              <Ionicons name="document-text" size={20} color={Colors.PRIMARY} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No topics available for {selectedSubject}. Try a different subject!
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedTopic && { opacity: 0.5 },
        ]}
        onPress={handleContinue}
        disabled={!selectedTopic || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedCard: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#444',
  },
  continueButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 18,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  continueButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-semibold',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default TopicSelection;
