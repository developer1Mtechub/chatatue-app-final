import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import fonts from '../styles/fonts';
import { normalizeFontSize } from '../styles/responsive';
import theme from '../styles/theme';
import Button from './ButtonComponent';
import Icon from 'react-native-vector-icons/AntDesign'

const ContactItems = ({ item }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.close}>
                <Icon name='close' size={24} color={theme.colors.labelColors} />
            </TouchableOpacity>
            <FastImage
                source={{ uri: "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", priority: FastImage.priority.high }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
            />
            <Text style={styles.textStyle}>Emily Johnson</Text>
            <Button title={'Message'}
                customStyle={styles.button}
                textCustomStyle={styles.text}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#454343',
        width: 160,
        margin: 10,
        borderRadius: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignSelf: 'center',
        marginTop: 20,
        borderWidth: 0.5,
        borderColor: theme.colors.textHeading
    },
    textStyle: {
        fontFamily: fonts.fontsType.regular,
        fontSize: normalizeFontSize(14),
        color: theme.colors.labelColors,
        alignSelf: 'center',
        marginTop: 10
    },
    button: {
        width: '80%',
        borderRadius: 10,
        height: 35,
        marginBottom: 20,
        marginTop: 10
    },
    text: { fontFamily: fonts.fontsType.medium, fontSize: normalizeFontSize(12) },
    close: {
        position: 'absolute',
        right: 10,
        top: 5
    }
});


export default ContactItems;
