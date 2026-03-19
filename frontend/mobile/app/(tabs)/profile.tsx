import { View, Text, StyleSheet } from 'react-native';

export default function ProfileTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, fontWeight: '500', color: '#1a1a1a' },
});
