import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
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

const PreviousYearPaper = () => {
  const { selectedStandard } = useContext(AuthContext);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Previous Year Papers',
    });
  }, [navigation]);

  // Fetch papers from Firestore using the modular SDK.
  const fetchPapers = useCallback(async () => {
    try {
      const papersCollectionRef = collection(db, 'PreviousYearPapers');
      const querySnapshot = await getDocs(papersCollectionRef);
      const fetchedPapers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(fetchedPapers);
      setError(null);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError('Failed to load papers. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);
  // Handle opening a paper link.
  const handleOpenPaper = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Paper', 'This paper is not currently available');
      return;
    }
    navigation.navigate('WebViewScreen', { url });
  }, [navigation]);

  // Render each paper item.
  const renderPaperItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => item.drivelink && handleOpenPaper(item.drivelink)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.yearBadge}>📅 {item.year}</Text>
        <Text style={styles.classTag}>Class {item.class}</Text>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      
      {item.drivelink ? (
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>View Paper →</Text>
        </View>
      ) : (
        <Text style={styles.disabledLink}>🚫 Currently Unavailable</Text>
      )}
    </TouchableOpacity>
  ), [handleOpenPaper]);

  // Filter papers by comparing the lowercase versions of the document's class and the selected standard.
  const filteredPapers = papers.filter(
    paper => paper.class.toLowerCase() === selectedStandard.toLowerCase()
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Papers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchPapers} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Previous Year Papers</Text>
        <Text style={styles.subHeader}>{selectedStandard} Question Papers</Text>
      </View>
      <FlatList
        data={filteredPapers}
        keyExtractor={item => item.id}
        renderItem={renderPaperItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No papers available for {selectedStandard}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
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
  card: {
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
