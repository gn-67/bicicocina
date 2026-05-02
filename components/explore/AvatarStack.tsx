import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Props = { avatars: string[] };

export default function AvatarStack({ avatars }: Props) {
  const shown = avatars.slice(0, 3);
  return (
    <View style={styles.row}>
      {shown.map((url, i) => (
        <Image
          key={url}
          source={{ uri: url }}
          style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#ddd',
  },
});
