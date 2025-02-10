import { useNavigation } from 'expo-router';
import React,{useEffect} from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Attendance = () => {


  const navigation = useNavigation();
  useEffect(()=>{
    navigation.setOptions({
      title: 'Attendance',
    })
    },[])
  return (
    <View style={styles.container}>
      <Text style={styles.comingSoonText}>Attendance Section</Text>
      <Text style={styles.message}>Coming Soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  comingSoonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#555',
  },
});

export default Attendance;
