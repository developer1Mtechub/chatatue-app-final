import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';
import theme from '../styles/theme';
import FastImage from 'react-native-fast-image';

const ClubItems = ({ item, onPress }) => {

    const handlePress = useCallback(() => {
        if (onPress) {
            onPress(item);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPress]);

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={styles.item}>
                <FastImage
                    source={{ uri: item?.images[0]?.url, priority: FastImage.priority.high }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <Text style={styles.title}>{item?.name}</Text>
            </View>
            <View style={styles.divider} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    title: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.white
    },
    divider: {
        height: 0.4,
        backgroundColor: '#ccc',
        marginTop: 8,
    },
});

export default ClubItems;
