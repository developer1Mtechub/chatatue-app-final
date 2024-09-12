import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';
import theme from '../styles/theme';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/AntDesign'; // Add the icon package

const ClubMembersItem = ({ item, onPress, selectedItems, setSelectedItems }) => {
    // Function to handle item selection
    const handlePress = useCallback(() => {
        if (onPress) {
            onPress(item);
        }

        if (selectedItems.includes(item)) {
            // Remove item from selected items
            setSelectedItems(selectedItems.filter(i => i !== item));
        } else {
            // Add item to selected items
            setSelectedItems([...selectedItems, item]);
        }
    }, [onPress, item, selectedItems, setSelectedItems]);

    const isSelected = selectedItems.includes(item); // Check if the item is selected

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={styles.item}>
                <FastImage
                    source={{ uri: item?.user_details?.profile_image?.url, priority: FastImage.priority.high }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <Text style={styles.title}>{item?.user_details?.username || 'No Name'}</Text>
                {isSelected && (
                    <Icon name="checkcircle" size={20} color="green" style={styles.icon} /> // "done" icon
                )}
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
        justifyContent: 'space-between',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 0.5,
        borderColor: theme.colors.textHeading
    },
    title: {
        flex: 1,
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.white,
    },
    icon: {
        marginLeft: 10,
    },
    divider: {
        height: 0.4,
        backgroundColor: '#ccc',
        marginTop: 8,
    },
});

export default ClubMembersItem;
