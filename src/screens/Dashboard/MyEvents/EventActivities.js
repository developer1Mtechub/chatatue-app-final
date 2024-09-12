// App.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, ScrollView } from 'react-native';
import theme from '../../../styles/theme';
import { normalizeFontSize } from '../../../styles/responsive';
import fonts from '../../../styles/fonts';
import Header from '../../../components/Header';
import { useDispatch, useSelector } from 'react-redux';
import { SCREENS } from '../../../constant/constants';
import { resetNavigation } from '../../../utils/resetNavigation';
import useBackHandler from '../../../utils/useBackHandler';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { getAllEventActivities } from '../../../redux/EventSlices/getAllEventActivitiesSlice';

const Activities = ({ item }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                {item?.name}
            </Text>
            <Text style={[styles.time, { fontFamily: fonts.fontsType.medium, fontSize: 14 }]}>
                {`Description :`}
                <Text style={styles.time}>
                    {` ${item?.description}`}
                </Text>
            </Text>
            <Text style={[styles.time, { fontFamily: fonts.fontsType.medium, fontSize: 14 }]}>
                {`Location :`}
                <Text style={styles.time}>
                    {` ${item?.location}`}
                </Text>
            </Text>
        </View>
    );
};

const EventActivities = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading, activities, currentPage, totalPages } = useSelector((state) => state.getAllEventActivities)
    const { data } = useSelector((state) => state.general)
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);


    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.EVENT_DETAIL)
        return true;
    }

    useBackHandler(handleBackPress)

    useEffect(() => {
        dispatch(getAllEventActivities({ page: page, limit: 10, searchPayload: { event_id: data.eventId } }))

    }, [dispatch, data, page])

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1)
        dispatch(getAllEventActivities({ page: 1, limit: 10, searchPayload: { event_id: data.eventId } }))
            .then(() => setRefreshing(false))
            .catch(() => setRefreshing(false));
    };

    const handleLoadMore = useCallback(() => {
        if (currentPage < totalPages && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [currentPage, totalPages, loading]);


    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    const showFooterSpinner = () => {
        return <FullScreenLoader
            indicatorSize={40}
            loading={loading} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                onBackPress={handleBackPress}
                isBackIcon={true}
                title={"Event Activities"}
            />
            {loading && page == 1 && !refreshing ? showLoader() : activities?.length > 0 ? (< FlatList
                data={activities}
                renderItem={({ item }) => <Activities item={item} />}
                contentContainerStyle={styles.list}
                keyExtractor={(item, index) => item?.toString() + index}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={loading && !refreshing && (<View style={styles.footer}>
                    {showFooterSpinner()}
                </View>)}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.textHeading]}
                        progressBackgroundColor={theme.colors.secondary}
                    />
                }
            />) : (
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.textHeading]}
                            progressBackgroundColor={theme.colors.secondary}
                        />
                    }
                >
                    {/* //list empty component */}
                </ScrollView>
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
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default EventActivities;
