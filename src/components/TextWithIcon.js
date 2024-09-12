import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // You can use any icon library
import theme from '../styles/theme';
import { normalizeFontSize, scaleWidth } from '../styles/responsive';
import fonts from '../styles/fonts';

const TextWithIcon = ({ iconName, text, subText, iconSize = 28, iconColor = theme.colors.labelColors, textStyle }) => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Icon name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
                <Text style={[styles.text, textStyle]}>{text}</Text>
            </View>
            {subText && <Text style={[styles.text, textStyle, { marginHorizontal: scaleWidth(45) }]}>{subText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 20,
    },
    text: {
        fontSize: normalizeFontSize(14),
        color: theme.colors.labelColors,
        fontFamily: fonts.fontsType.medium
    },
});

export default TextWithIcon;
