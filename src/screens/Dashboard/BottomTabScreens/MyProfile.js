//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../../styles/theme';
import fonts from '../../../styles/fonts';
import { normalizeFontSize } from '../../../styles/responsive';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/AuthSlices/signInSlice';

// create a component
const MyProfile = () => {
    const dispatch = useDispatch();
    return (
        <View style={styles.container}>
            <Text
                onPress={() => {
                    dispatch(logout())
                }}
                style={{ color: theme.colors.error, fontFamily: fonts.fontsType.bold, fontSize: normalizeFontSize(26) }}>Logout</Text>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
    },
});

//make this component available to the app
export default MyProfile;
