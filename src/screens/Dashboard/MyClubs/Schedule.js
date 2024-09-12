// App.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import theme from '../../../styles/theme';
import { normalizeFontSize } from '../../../styles/responsive';
import fonts from '../../../styles/fonts';
import Header from '../../../components/Header';
import { useDispatch, useSelector } from 'react-redux';
import { SCREENS } from '../../../constant/constants';
import { resetNavigation } from '../../../utils/resetNavigation';
import useBackHandler from '../../../utils/useBackHandler';
import { getSchedule } from '../../../redux/ClubCreation/getScheduleSlice';
import FullScreenLoader from '../../../components/FullScreenLoader';
import moment from 'moment';

const ScheduleCard = ({ schedule }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{schedule.day} - {schedule.time_name}</Text>
            <Text style={styles.time}>{`Start Time : ${schedule.start_time} ${moment(schedule.start_time, 'HH:mm:ss').format('A')}`}</Text>
            <Text style={styles.time}>{`End Time : ${schedule.end_time} ${moment(schedule.end_time, 'HH:mm:ss').format('A')}`}</Text>
        </View>
    );
};

const Schedule = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading, schedules } = useSelector((state) => state.getSchedule)
    const { data } = useSelector((state) => state.general)
    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.CLUB_DETAIL)
        return true;
    }

    useBackHandler(handleBackPress)

    useEffect(() => {
        dispatch(getSchedule({ page: 1, limit: 50, payload: { clubId: data.clubId } }))

    }, [dispatch, data])


    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                onBackPress={handleBackPress}
                isBackIcon={true}
                title={"Club Schedules"}
            />
            {loading ? showLoader() : <FlatList
                data={schedules}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ScheduleCard schedule={item} />}
                contentContainerStyle={styles.list}
            />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    list: {
        paddingHorizontal: 20
    },
    card: {
        backgroundColor: theme.colors.lightGrey,
        borderRadius: 8,
        padding: 8,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,

    },
    title: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.textHeading,
        marginBottom: 4,
    },
    time: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.regular,
        color: theme.colors.white,
        marginBottom: 8,
    },
    info: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.regular,
        color: theme.colors.labelColors,
    },
});

export default Schedule;
