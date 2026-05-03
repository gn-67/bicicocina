import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

const ARTWORK_IMAGE = "https://www.figma.com/api/mcp/asset/74f47346-8c00-43ec-a4e2-4d32fe2a5864";

type Props = {
  title: string;
  description: string;
  backgroundColor: string;
  style?: ViewStyle;
};

export default function LearningCard({ title, description, backgroundColor, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.topSection, { backgroundColor }]}>
        <Image 
          source={{ uri: ARTWORK_IMAGE }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 244,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f3f4f8',
  },
  topSection: {
    height: '60%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '120%',
    height: '120%',
    opacity: 0.6,
    transform: [{ rotate: '20deg' }],
  },
  bottomSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#9596a0',
    lineHeight: 16,
  },
});
