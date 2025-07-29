import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FREETEST_CACHE_KEY = 'freeTestCache';
const FREETEST_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

const FreeTest = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { selectedStandard, selectedStandardColor, selectedTopic, selectedSubject } = useContext(AuthContext);
  const navigation = useNavigation();

  // Search states
  const [searchTitle, setSearchTitle] = useState(selectedTopic);
  const [searchSubject, setSearchSubject] = useState(selectedSubject);

  useEffect(() => {
    navigation.setOptions({
      title: 'Test',
    });
  }, [navigation]);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);

      // Check for cached data
      const cachedDataString = await AsyncStorage.getItem(FREETEST_CACHE_KEY);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        if (cachedData?.timestamp && Date.now() - cachedData.timestamp < FREETEST_CACHE_EXPIRY) {
          console.log('Using cached tests data');
          setTests(cachedData.data);
          setError(null);
          return;
        }
      }

      // Fetch from Firestore if no valid cache is found
      const testsCollectionRef = collection(db, 'FreeTest');
      const querySnapshot = await getDocs(testsCollectionRef);
      const fetchedTests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTests(fetchedTests);
      setError(null);

      // Store fresh data in cache
      await AsyncStorage.setItem(
        FREETEST_CACHE_KEY,
        JSON.stringify({ data: fetchedTests, timestamp: Date.now() })
      );
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTests();
  }, [fetchTests]);

  const handleOpenTest = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Test', 'This test is not currently available');
      return;
    }
    router.push({
      pathname: '/helper/WebViewScreen',
      params: { url },
    });
  }, []);

  // Filter tests based on standard, title, and subject.
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesStandard = test.class.toLowerCase() === selectedStandard.toLowerCase();
      const matchesTitle = test.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesSubject = test.subject.toLowerCase().includes(searchSubject.toLowerCase());
      return matchesStandard && matchesTitle && matchesSubject;
    });
  }, [tests, selectedStandard, searchTitle, searchSubject]);

  const TestCard = useCallback(({ item }) => (
    <View style={styles.testCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.classBadge}>📚 {item.class}</Text>
        <Text style={styles.testType}>📝 Practice Test</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.subjectText}>Subject: {item.subject}</Text>
      {item.drivelink ? (
        <TouchableOpacity style={styles.linkContainer} onPress={() => handleOpenTest(item.drivelink)}>
          <Text style={styles.linkText}>Start Test →</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.disabledLink}>🚫 Currently Unavailable</Text>
      )}
    </View>
  ), [handleOpenTest]);

  const keyExtractor = useCallback(item => item.id, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Tests...</Text>
      </SafeAreaView>
    );
  }

  if (error && tests.length === 0) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchTests} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: selectedStandardColor }]}>
      <FlatList
        data={filteredTests}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <TestCard item={item} />}
        ListHeaderComponent={
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>{selectedStandard} Assessment Papers</Text>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Title"
                placeholderTextColor="#888"
                value={searchTitle}
                onChangeText={setSearchTitle}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Subject"
                placeholderTextColor="#888"
                value={searchSubject}
                onChangeText={setSearchSubject}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No tests available for {selectedStandard}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        initialNumToRender={5}
        windowSize={10}
        maxToRenderPerBatch={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#FFF',
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
    marginBottom: 8,
    lineHeight: 24,
  },
  subjectText: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 16,
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
