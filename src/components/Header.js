// Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../styles/theme';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../styles/responsive';
import fonts from '../styles/fonts';
import { BackButton } from '../assets/svgs';
import Button from './ButtonComponent';
import FastImage from 'react-native-fast-image';

const Header = ({
    title,
    onBackPress,
    onFirstIconPress,
    onSecondIconPress,
    firstIconName,
    secondIconName,
    firstIconColor,
    secondIconColor,
    onThirdIconPress,
    thirdIconName,
    thirdIconColor,
    titleColor = '#000',
    backgroundColor = '#fff',
    isBackIcon = false,
    isOtherIcon = false,
    isButton = false,
    buttonPress,
    loading,
    buttonText = 'Follow',
    buttonTextStyle,
    buttonStyle,
    buttonContainerStyle,
    customHeaderStyle,
    isProfile = false,
    profileUri
}) => {
    return (
        <View style={[styles.headerContainer, customHeaderStyle]}>
            {isBackIcon && <TouchableOpacity style={[styles.iconButton, { marginLeft: 0 }]} onPress={onBackPress}>
                <BackButton width={scaleWidth(40)} height={scaleHeight(40)} />
            </TouchableOpacity>}
            {isProfile && <TouchableOpacity style={[styles.iconButton, { marginLeft: 0, }]} onPress={onBackPress}>
                <FastImage
                    source={{ uri: profileUri, priority: FastImage.priority.high }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </TouchableOpacity>}
            <Text style={[styles.title, { color: theme.colors.textHeading, marginHorizontal: 15 }]}>{title}</Text>
            <View style={styles.iconContainer}>

                <TouchableOpacity style={styles.iconButton} onPress={onThirdIconPress}>
                    {!isOtherIcon ? <Icon name={thirdIconName} size={24} color={thirdIconColor} /> :
                        <MaterialCommunityIcons name={thirdIconName} size={24} color={thirdIconColor} />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={onFirstIconPress}>
                    {/* <Icon name={firstIconName} size={24} color={firstIconColor} /> */}
                    <MaterialCommunityIcons name={firstIconName} size={24} color={firstIconColor} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.iconButton} onPress={onSecondIconPress}>
                    {!isOtherIcon ? <Icon name={secondIconName} size={24} color={secondIconColor} /> :
                        <MaterialCommunityIcons name={secondIconName} size={24} color={secondIconColor} />}
                </TouchableOpacity>

            </View>
            {isButton && <View style={[{ flex: 0.8 }, buttonContainerStyle]}>
                <Button
                    loading={loading}
                    onPress={buttonPress}
                    title={buttonText}
                    customStyle={[
                        styles.buttonStyle,
                        buttonStyle
                    ]}
                    textCustomStyle={[styles.buttonTextStyle, buttonTextStyle]}
                />
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        width: '100%',
        elevation: 3,
        backgroundColor: theme.colors.primary
    },
    title: {
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.bold,
        flex: 1
    },
    iconContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        //marginLeft: 16,
        paddingHorizontal: 8,
    },
    buttonStyle: {
        // width: '30%',
        marginBottom: 0,
        marginTop: 0,
        height: scaleHeight(30),
        borderRadius: 10
    },
    buttonTextStyle: { fontSize: normalizeFontSize(12), fontFamily: fonts.fontsType.medium },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: theme.colors.textHeading,
    },
});

export default Header;
