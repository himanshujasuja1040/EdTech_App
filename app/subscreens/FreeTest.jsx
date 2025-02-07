import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  Alert 
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FreeTest = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true); // Initially true while loading
  const [error, setError] = useState(null);
  const { selectedStandard } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Test',
    });
  }, [navigation]);

  // Function to fetch tests from Firestore
  const fetchTests = useCallback(async () => {
    try {
      const testsCollectionRef = collection(db, 'FreeTest');
      const querySnapshot = await getDocs(testsCollectionRef);
      const fetchedTests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTests(fetchedTests);
      setError(null);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);


  const handleOpenTest = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Test', 'This test is not currently available');
      return;
    }
    
  }, [navigation]);

  const renderTest = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.testCard}
      activeOpacity={0.9}
      onPress={() => item.drivelink && handleOpenTest(item.drivelink)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.classBadge}>📚 {item.class}</Text>
        <Text style={styles.testType}>📝 Practice Test</Text>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

      {item.drivelink ? (
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Start Test →</Text>
        </View>
      ) : (
        <Text style={styles.disabledLink}>🚫 Currently Unavailable</Text>
      )}
    </TouchableOpacity>
  ), [handleOpenTest]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Tests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchTests} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter tests based on the selected standard (e.g., "11th Class")
  const filteredTests = tests.filter(test => 
    test.class.toLowerCase() === selectedStandard.toLowerCase()
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Practice Tests</Text>
        <Text style={styles.subHeader}>{selectedStandard} Assessment Papers</Text>
      </View>

      <FlatList
        data={filteredTests}
        keyExtractor={item => item.id}
        renderItem={renderTest}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No tests available for {selectedStandard}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#636E72',
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classBadge: {
    backgroundColor: '#4CAF5020',
    color: '#2D3436',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  testType: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
    lineHeight: 24,
  },
  linkContainer: {
    backgroundColor: '#4CAF5020',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledLink: {
    color: '#636E72',
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#4CAF50',
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#636E72',
    textAlign: 'center',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default React.memo(FreeTest);
