import React, { Component, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useAlert } from '../../../providers/AlertContext';
import { resetNavigation } from '../../../utils/resetNavigation';
import useBackHandler from '../../../utils/useBackHandler';
import { getInvitiesList } from '../../../redux/EventSlices/getInvitiesListSlice';
import { setData } from '../../../redux/generalSlice';
import FullScreenLoader from '../../../components/FullScreenLoader';
import InvitiesUserList from '../../../components/InvitiesUserList';
import Header from '../../../components/Header';
import theme from '../../../styles/theme';
import { normalizeFontSize, scaleHeight } from '../../../styles/responsive';
import fonts from '../../../styles/fonts';
import { SCREENS } from '../../../constant/constants';


const ManageEventParticipants = ({ navigation }) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { invitiesList, loading } = useSelector((state) => state.getInvitiesList)
    const { data } = useSelector((state) => state.general)
    const totalInvitees = invitiesList?.length || 0;
    const inviteesJoined = invitiesList?.filter(invite => invite.status === "ACCEPTED").length || 0;
    const notRespondedInvitees = invitiesList?.filter(invite => invite.status === "PENDING").length || 0;

    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.EVENT_DETAIL)
        return true;
    }
    useBackHandler(handleBackPress)


    useEffect(() => {
        dispatch(getInvitiesList(data?.eventId));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, data]);


    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    const renderRSVPDetail = () => {
        return (
            <View style={styles.detailContainer}>
                <View style={styles.cardContainer}>
                    <View style={[styles.card, styles.totalInvitees]}>
                        <Text style={styles.cardTitle}>Total Invitees</Text>
                        <Text style={styles.cardData}>{totalInvitees}</Text>
                    </View>

                    <View style={[styles.card, styles.inviteesJoined]}>
                        <Text style={styles.cardTitle}>Invitees who joined</Text>
                        <Text style={styles.cardData}>{inviteesJoined}</Text>
                    </View>
                </View>

                <View style={styles.cardContainer}>
                    <View style={[styles.card, styles.notRespondedInvitees]}>
                        <Text style={styles.cardTitle}>Total Not responded Invitees</Text>
                        <Text style={styles.cardData}>{notRespondedInvitees}</Text>
                    </View>
                </View>
            </View>
        );

    }


    return (
        <SafeAreaView style={styles.container}>
            <Header
                onBackPress={handleBackPress}
                title={data?.eventName}
                isBackIcon={true}
                customHeaderStyle={{ paddingHorizontal: 15 }}
            />
            {renderRSVPDetail()}
            {loading ? showLoader() :
                invitiesList?.length > 0 && (
                    <View style={{ paddingHorizontal: 10 }}>

                        <FlatList
                            data={invitiesList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <InvitiesUserList item={item} />}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )
            }

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    list: {
        justifyContent: 'space-between',
        marginHorizontal: 10
    },
    listContainer: {
        alignItems: 'center',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    sheetContainer: {
        borderTopEndRadius: 30,
        borderTopStartRadius: 30,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: theme.colors.primary,
        height: '35%'
    },
    wrapper: {
        backgroundColor: theme.colors.backDropColor,
    },
    contentContainer: {
        padding: 20,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
    },
    headerText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
        flex: 1,
    },
    buttonContainer: {
        marginTop: scaleHeight(0),
        marginBottom: scaleHeight(0),
    },
    button: {
        width: '90%',
        borderRadius: 10,
        marginBottom: 0,
    },
    makeAdminButton: {
        backgroundColor: theme.colors.success,
        marginTop: 5,
    },
    removeButton: {
        backgroundColor: theme.colors.error,
        marginTop: 10,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: normalizeFontSize(12),
    },
    detailContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        flex: 1,
        height: 100,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        marginHorizontal: 5,
        paddingHorizontal: 10
    },
    totalInvitees: {
        backgroundColor: '#ff9a9a',
    },
    inviteesJoined: {
        backgroundColor: '#71e5a1',
    },
    notRespondedInvitees: {
        backgroundColor: '#b39ddb',
        flex: 2,
    },
    cardTitle: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.white,
        width: '60%'
    },
    cardData: {
        fontSize: normalizeFontSize(18),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.white,
        marginEnd: 20
    },
});

export default ManageEventParticipants;
