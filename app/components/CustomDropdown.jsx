import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';

const CustomDropdown = ({ options, placeholder = "Select", selectedValue, onValueChange }) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (option) => {
    onValueChange(option);
    setVisible(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(!visible)}
      >
        <Text style={[styles.dropdownText, !selectedValue && styles.placeholder]}>
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>
      {visible && (
        <ScrollView style={styles.dropdownList}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => handleSelect(option.label)}
            >
              <Text style={styles.dropdownItemText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  dropdown: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    backgroundColor: Colors.WHITE,
  },
  dropdownText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: 'black',
  },
  placeholder: {
    color: Colors.GRAY,
  },
  dropdownList: {
    position: 'absolute',
    top: 65, // adjust based on your dropdown height
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    zIndex: 1000,
    maxHeight: 200, // maximum height for the list; enables scrolling if items exceed this height
  },
  dropdownItem: {
    padding: 15,
  },
  dropdownItemText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: 'black',
  },
});

export default CustomDropdown;
