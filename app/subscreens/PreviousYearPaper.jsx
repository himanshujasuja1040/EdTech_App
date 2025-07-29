import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAPER_CACHE_KEY = 'previousYearPaperCache';
const PAPER_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

const PreviousYearPaper = () => {
  const { selectedStandard, selectedStandardColor, selectedTopic, selectedSubject } = useContext(AuthContext);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Search state variables
  const [yearQuery, setYearQuery] = useState('');
  const [subjectQuery, setSubjectQuery] = useState(selectedSubject);
  const [titleQuery, setTitleQuery] = useState(selectedTopic);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Previous Year Papers',
    });
  }, [navigation]);

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);

      // Check AsyncStorage for cached papers
      const cachedDataString = await AsyncStorage.getItem(PAPER_CACHE_KEY);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        if (cachedData?.timestamp && Date.now() - cachedData.timestamp < PAPER_CACHE_EXPIRY) {
          console.log('Using cached papers data');
          setPapers(cachedData.data);
          setError(null);
          return;
        }
      }

      // Fetch fresh data from Firestore if no valid cache is found
      const papersCollectionRef = collection(db, 'PreviousYearPapers');
      const querySnapshot = await getDocs(papersCollectionRef);
      const fetchedPapers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(fetchedPapers);
      setError(null);

      // Store fresh data in cache with timestamp
      await AsyncStorage.setItem(
        PAPER_CACHE_KEY,
        JSON.stringify({ data: fetchedPapers, timestamp: Date.now() })
      );
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError('Failed to load papers. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPapers();
  }, [fetchPapers]);

  const handleOpenPaper = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Paper', 'This paper is not currently available');
      return;
    }
    router.push({
      pathname: '/helper/WebViewScreen',
      params: { url },
    });
  }, []);

  // Filter papers by selected standard and search queries.
  const filteredPapers = papers.filter(paper => {
    const matchesStandard = paper.class.toLowerCase() === selectedStandard.toLowerCase();
    const matchesYear = yearQuery.trim() === '' || paper.year.toString().toLowerCase().includes(yearQuery.toLowerCase());
    const matchesSubject = subjectQuery.trim() === '' || paper.subject.toLowerCase().includes(subjectQuery.toLowerCase());
    const matchesTitle = titleQuery.trim() === '' || (paper.title && paper.title.toLowerCase().includes(titleQuery.toLowerCase()));
    return matchesStandard && matchesYear && matchesSubject && matchesTitle;
  });

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{selectedStandard} Question Papers</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by year"
          placeholderTextColor="#888"
          value={yearQuery}
          onChangeText={setYearQuery}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by subject"
          placeholderTextColor="#888"
          value={subjectQuery}
          onChangeText={setSubjectQuery}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title"
          placeholderTextColor="#888"
          value={titleQuery}
          onChangeText={setTitleQuery}
        />
      </View>
    </View>
  );

  const renderPaperItem = useCallback(({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.yearBadge}>📅 {item.year}</Text>
        <Text style={styles.classTag}>Class {item.class}</Text>
      </View>
      <Text style={styles.subject}>Subject: {item.subject}</Text>
      <Text style={styles.subject}>{item.title}</Text>
      {item.drivelink ? (
        <TouchableOpacity style={styles.linkContainer} onPress={() => handleOpenPaper(item.drivelink)}>
          <Text style={styles.linkText}>View Paper →</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.disabledLink}>🚫 Currently Unavailable</Text>
      )}
    </View>
  ), [handleOpenPaper]);

  const keyExtractor = useCallback(item => item.id, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Papers...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchPapers} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: selectedStandardColor }]}>
      <FlatList
        data={filteredPapers}
        keyExtractor={keyExtractor}
        renderItem={renderPaperItem}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{selectedStandard} Question Papers</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by year"
          placeholderTextColor="#888"
          value={yearQuery}
          onChangeText={setYearQuery}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by subject"
          placeholderTextColor="#888"
          value={subjectQuery}
          onChangeText={setSubjectQuery}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title"
          placeholderTextColor="#888"
          value={titleQuery}
          onChangeText={setTitleQuery}
        />
      </View>
    </View>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No papers available for {selectedStandard} matching your search.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerWrapper: {
    paddingTop: 16,
    paddingBottom: 16,
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
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 0.25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearBadge: {
    backgroundColor: '#4CAF5020',
    color: '#2D3436',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  classTag: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  subject: {
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

export default React.memo(PreviousYearPaper);
