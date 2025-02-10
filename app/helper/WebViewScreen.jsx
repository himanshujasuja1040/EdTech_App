import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useNavigation } from 'expo-router';

const WebViewScreen = () => {
  const navigation=useNavigation();
  useEffect(()=>{
    navigation.setOptions({
      title:''
    })
  })
  const { url } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <WebView source={{ uri: url }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default WebViewScreen;
