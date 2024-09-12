import React, { forwardRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using Material Icons for the close icon
import theme from '../styles/theme';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';
import { CloseIcon } from '../assets/svgs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomSheet = forwardRef(
    ({
        title = '',
        children,
        height = SCREEN_HEIGHT,
        closeOnDragDown = false,
        customStyles = {},
        onClose,
        isHeader = false
    }, ref) => {
        return (
            <RBSheet
                ref={ref}
                closeOnDragDown={closeOnDragDown}
                closeOnPressMask={true}
                height={height}
                customStyles={{
                    wrapper: styles.wrapper,
                    draggableIcon: styles.draggableIcon,
                    container: { ...styles.container, ...customStyles },
                }}
            >
                {isHeader && <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={() => ref.current.close()} style={styles.closeButton}>
                        <CloseIcon width={24} height={24} />
                    </TouchableOpacity>
                </View>}
                <View style={styles.content}>
                    {children}
                </View>
            </RBSheet>
        );
    }
);

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: theme.colors.backDropColor,
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: theme.colors.primary,
        paddingBottom: 16,
    },
    draggableIcon: {
        backgroundColor: theme.colors.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    title: {
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.textHeading,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
});

export default CustomSheet;
