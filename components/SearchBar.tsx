import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GeocodeSuggestion } from '../lib/types';

type Props = {
  expanded: boolean;
  value: string;
  suggestions: GeocodeSuggestion[];
  loadingSuggestions: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (s: GeocodeSuggestion) => void;
};

export default function SearchBar({
  expanded,
  value,
  suggestions,
  loadingSuggestions,
  onExpand,
  onCollapse,
  onChangeText,
  onSelectSuggestion,
}: Props) {
  const inputRef = useRef<TextInput>(null);

  const handleExpand = () => {
    onExpand();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!expanded) {
    return (
      <Pressable style={styles.pill} onPress={handleExpand}>
        <Ionicons name="bicycle" size={20} color="#777" style={styles.leftIcon} />
        <Text style={styles.placeholder}>Search for Destination</Text>
      </Pressable>
    );
  }

  return (
    <View>
      {/* Search pill — expanded */}
      <View style={styles.pill}>
        <Ionicons name="bicycle" size={20} color="#777" style={styles.leftIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search for Destination"
          placeholderTextColor="#777"
          returnKeyType="search"
          autoCorrect={false}
        />
        {loadingSuggestions ? (
          <ActivityIndicator size="small" color="#777" style={styles.rightIcon} />
        ) : (
          <Pressable onPress={onCollapse} hitSlop={10} style={styles.rightIcon}>
            <Ionicons name="close" size={18} color="#777" />
          </Pressable>
        )}
      </View>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((s, i) => (
            <React.Fragment key={s.id}>
              <Pressable
                style={styles.suggestionRow}
                onPress={() => onSelectSuggestion(s)}
              >
                <Ionicons name="location-outline" size={14} color="#777" style={styles.pinIcon} />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.suggestionPlace} numberOfLines={1}>{s.placeName}</Text>
                </View>
              </Pressable>
              {i < suggestions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    paddingHorizontal: 14,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  placeholder: {
    flex: 1,
    fontSize: 12,
    color: '#777',
    letterSpacing: 1.2,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    letterSpacing: 1.2,
    paddingVertical: 0,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 44,
  },
  pinIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 12,
    color: '#333',
    letterSpacing: 1.2,
  },
  suggestionPlace: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 46,
  },
});
