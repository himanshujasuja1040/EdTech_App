import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  RefreshControl
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // Show loading indicator until data is fetched
  const [error, setError] = useState(null);
  const { selectedStandard } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();

  // Search states for filtering books by title, detail, and subject
  const [searchTitle, setSearchTitle] = useState('');
  const [searchDetail, setSearchDetail] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: 'Books',
    });
  }, [navigation]);

  // Fetch books from the "Books" collection
    const fetchBooks = useCallback(async () => {
      try {
        setLoading(true)
        const booksCollectionRef = collection(db, 'Books');
        const querySnapshot = await getDocs(booksCollectionRef);
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBooks(fetchedBooks);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
        setRefreshing(false)
      }
    },[]);
    
  
    useEffect(() => {
      fetchBooks();
    }, [fetchBooks]);

   const handleRefresh = useCallback(() => {
      setRefreshing(true);
      fetchBooks();
    }, [fetchBooks]);

  // Filter books based on selected standard and search queries
  const filteredBooks = useMemo(
    () =>
      books.filter(book => {
        const matchesStandard =
          book.class.toLowerCase() === selectedStandard.toLowerCase();
        const matchesTitle = book.title
          .toLowerCase()
          .includes(searchTitle.toLowerCase());
        const matchesDetail = book.detail
          .toLowerCase()
          .includes(searchDetail.toLowerCase());
        const matchesSubject = book.subject
          .toLowerCase()
          .includes(searchSubject.toLowerCase());
        return matchesStandard && matchesTitle && matchesDetail && matchesSubject;
      }),
    [books, selectedStandard, searchTitle, searchDetail, searchSubject]
  );

  // Open the book link in a webview or external browser
  const handleOpenBook = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Link', 'This book is not currently available');
      return;
    }
    router.push({
      pathname: '/helper/WebViewScreen',
      params: { url },
    });
    // Alternatively, you can use navigation.navigate('WebViewScreen', { url });
  }, []);

  // Render each book item in a card-like horizontal layout
  const BookItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../../assets/images/placeholder.jpeg')}
              style={styles.courseImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.cardContent}>
            <View style={styles.badgesContainer}>
              <Text style={styles.classBadge}>🏫 Class {item.class}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {item.subject}
            </Text>
            <Text style={styles.detailText} numberOfLines={3}>
              {item.detail}
            </Text>
              <TouchableOpacity
                style={styles.openButton}
                onPress={() => handleOpenBook(item.drivelink)}
                activeOpacity={0.8}
              >
                <Text style={styles.openButtonText}>📖 Open Book</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [handleOpenBook]
  );

  const keyExtractor = useCallback(item => item.id, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Books...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredBooks}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <BookItem item={item} />}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Exclusive Books : {selectedStandard}</Text>
            </View>

            {/* Search Bars */}
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
                placeholder="Search by Detail"
                placeholderTextColor="#888"
                value={searchDetail}
                onChangeText={setSearchDetail}
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
            <Text style={styles.emptyText}>
              No books found for {selectedStandard}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 10,
    paddingBottom:40,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  listContent: {
    paddingBottom: 20,
  },
  card: {
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
  cardRow: {
    flexDirection: 'row',
  },
  courseImage: {
    width: 120,
    height: 120,
    marginTop: 15,
    marginLeft: 10,
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classBadge: {
    backgroundColor: '#e0f7fa',
    color: '#00796b',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
    flexShrink: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  openButton: {
    marginTop: 8,
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  openButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
});

export default React.memo(Books);
