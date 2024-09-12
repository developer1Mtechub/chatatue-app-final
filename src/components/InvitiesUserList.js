import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { normalizeFontSize, scaleWidth } from '../styles/responsive';
import fonts from '../styles/fonts';
import theme from '../styles/theme';
import HorizontalDivider from './HorizontalDivider';

const InvitiesUserList = ({ item }) => {
    const { profile_image, username } = item?.user

    const getColorByStatus = (status) => {

        switch (status) {
            case "ACCEPTED":
                return '#00E200';

            case "REJECTED":
                return '#FF2A04';

            case "PENDING":
                return '#F9D800';

            default:
                return '#00000000';
        }
    }

    const getNameByStatus = (status) => {

        switch (status) {
            case "ACCEPTED":
                return 'Coming';

            case "REJECTED":
                return 'Not Coming';

            case "PENDING":
                return 'Not Respond';
            default:
                return '';
        }
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: profile_image?.url }} style={styles.avatar} />
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{username}</Text>
                    </View>
                </View>

                <View style={[styles.tagStyle, { backgroundColor: getColorByStatus(item?.status), }]}>
                    <Text style={styles.tagLabel}>{getNameByStatus(item?.status)}</Text>
                </View>
            </View>
            <HorizontalDivider customStyle={styles.horizontalDividerStyle} />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: theme.colors.textHeading,
    },
    infoContainer: {
        marginLeft: 10,
        flex: 1,
    },
    name: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.white,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginEnd: scaleWidth(-50)
    },
    buttonStyle: {
        borderRadius: 8,
        width: '30%',
        height: 40,
        marginBottom: 0,
        marginTop: 0,
    },
    buttonTextStyle: {
        fontSize: normalizeFontSize(11),
    },
    buttonWithIcon: {
        marginHorizontal: '2%',
    },
    customIconStyle: {
        marginRight: 0,
        left: 0,
    },
    horizontalDividerStyle: {
        width: '83%',
        alignSelf: 'flex-end',
        marginEnd: '4%',
        marginVertical: 3,
    },
    tagStyle: {
        borderRadius: 10,
        padding: 8,
    },
    tagLabel: {
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(12),
        color: theme.colors.white
    }
});

export default InvitiesUserList;
