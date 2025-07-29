import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

export default function App() {
  const [form, setForm] = useState({
    receiver_name: '',
    receiver_addr: '',
    pan: '',
    date: '',
    opening_balance: '',
    total_sales: '',
    closing_balance: ''
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        'http://192.168.1.71:8080/generate',
        form,
        { responseType: 'arraybuffer' } // 👈 Fix 1: Get binary buffer
      );

      const safeName = form.receiver_name.replace(/[^a-zA-Z0-9]/g, '_'); // sanitize the filename
      const filename = `Sales_Confirmation_${safeName || 'Unnamed'}.docx`;
      const uri = FileSystem.documentDirectory + filename;

      const base64Data = Buffer.from(response.data, 'binary').toString('base64');

      await FileSystem.writeAsStringAsync(uri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
      }); 

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log('Error:', error);
      Alert.alert('Error', 'Failed to generate letter.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Confirmation Letter</Text>

      <TextInput style={styles.input} placeholder="Receiver Name" onChangeText={(val) => handleChange('receiver_name', val)} />
      <TextInput style={styles.input} placeholder="Receiver Address" onChangeText={(val) => handleChange('receiver_addr', val)} />
      <TextInput style={styles.input} placeholder="PAN Number" onChangeText={(val) => handleChange('pan', val)} />
      <TextInput style={styles.input} placeholder="Date (e.g. 2081/03/32)" onChangeText={(val) => handleChange('date', val)} />
      <TextInput style={styles.input} placeholder="Opening Balance" keyboardType="numeric" onChangeText={(val) => handleChange('opening_balance', val)} />
      <TextInput style={styles.input} placeholder="Total Sales" keyboardType="numeric" onChangeText={(val) => handleChange('total_sales', val)} />
      <TextInput style={styles.input} placeholder="Closing Balance" keyboardType="numeric" onChangeText={(val) => handleChange('closing_balance', val)} />
      
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
