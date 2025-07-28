import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [form, setForm] = useState({
    receiver_name: '',
    receiver_addr: '',
    pan: '',
    date: '',
    opening_balance: '',
    total_sales: '',
    closing_balance: '',
    receiver_signature: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8080/generate', form, {
        responseType: 'blob',
      });

      const uri = FileSystem.documentDirectory + 'Sales_Confirmation.docx';
      await FileSystem.writeAsStringAsync(uri, response.data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to generate letter.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Confirmation Form</Text>

      <TextInput style={styles.input} placeholder="Receiver Name" onChangeText={(val) => handleChange('receiver_name', val)} />
      <TextInput style={styles.input} placeholder="Receiver Address" onChangeText={(val) => handleChange('receiver_addr', val)} />
      <TextInput style={styles.input} placeholder="PAN Number" onChangeText={(val) => handleChange('pan', val)} />
      <TextInput style={styles.input} placeholder="Date (e.g. 2081/03/32)" onChangeText={(val) => handleChange('date', val)} />
      <TextInput style={styles.input} placeholder="Opening Balance" keyboardType="numeric" onChangeText={(val) => handleChange('opening_balance', val)} />
      <TextInput style={styles.input} placeholder="Total Sales" keyboardType="numeric" onChangeText={(val) => handleChange('total_sales', val)} />
      <TextInput style={styles.input} placeholder="Closing Balance" keyboardType="numeric" onChangeText={(val) => handleChange('closing_balance', val)} />
      <TextInput style={styles.input} placeholder="Receiver Signature" onChangeText={(val) => handleChange('receiver_signature', val)} />

      <Button title="Generate Letter" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center',
  },
  title: {
    fontSize: 22, marginBottom: 20, textAlign: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5,
  }
});
