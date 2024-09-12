import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import { scaleHeight } from '../styles/responsive';
import fonts from '../styles/fonts';
import theme from '../styles/theme';

const CustomToggleSwitch = ({ isEnabled, toggleSwitch, label, onColor, offColor, thumbOnStyle, thumbOffStyle, style }) => {
    return (
        <View style={[styles.container, style]}>
            <ToggleSwitch
                isOn={isEnabled}
                onColor={onColor || 'rgba(252, 226, 32, 0.15)'}
                offColor={offColor || 'rgba(217, 217, 217, 1)'}
                onValueChange={toggleSwitch}
                thumbOnStyle={thumbOnStyle || { backgroundColor: theme.colors.textHeading }}
                thumbOffStyle={thumbOffStyle || { backgroundColor: 'rgba(137, 137, 137, 1)' }}
                size="medium"
                onToggle={toggleSwitch}
            />
            <Text style={styles.label}>{label || ''}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginStart: 10,
    },
    label: {
        fontSize: scaleHeight(14),
        fontFamily: fonts.fontsType.semiBold,
        marginRight: 10,
        flex: 1,
        color: theme.colors.white,
        marginLeft: 15
    },
});

export default CustomToggleSwitch;
