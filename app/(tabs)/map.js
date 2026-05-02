import { View, Text, StyleSheet } from 'react-native';
import MapViewComponent from '../../components/MapView';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapViewComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
