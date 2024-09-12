import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import theme from '../styles/theme';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';
import Button from './ButtonComponent';

const DynamicDatePicker = ({ label, date, mode, onDateChange, format, openSheetRef, onConfirm }) => {
    const formattedDate = moment(date).format(format);

    return (
        <>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={() => openSheetRef.current.open()} style={styles.dateButton}>
                <Text style={styles.dateText}>{formattedDate}</Text>
            </TouchableOpacity>

            <RBSheet
                ref={openSheetRef}
                height={300}
                openDuration={250}
                customStyles={{
                    wrapper: styles.wrapper,
                    container: [styles.bottomSheet,{ backgroundColor: theme.colors.primary }]
                }}
            >
                <View style={styles.pickerWrapper}>
                    <DatePicker
                        date={date}
                        onDateChange={onDateChange}
                        mode={mode}
                        theme='dark'
                    />
                    <Button
                        onPress={() => {
                            openSheetRef.current.close();
                            onConfirm();
                        }}
                        customStyle={{ width: '70%' }}
                        title={`Confirm ${label}`}
                    />
                </View>
            </RBSheet>
        </>
    );
};

const styles = StyleSheet.create({
    label: {
        marginTop: 16,
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(14),
        color: theme.colors.white,
        marginHorizontal: 10,
    },
    dateButton: {
        height: 45,
        backgroundColor: theme.colors.inputBg,
        borderRadius: 20,
        marginVertical: 10,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    dateText: {
        color: theme.colors.white,
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.medium,
    },
    bottomSheet: {
        padding: 20,
    },
    pickerWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    wrapper: {
        backgroundColor: theme.colors.backDropColor,
    },
});

export default DynamicDatePicker;
