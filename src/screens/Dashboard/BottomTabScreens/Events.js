import React, { Component, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import theme from '../../../styles/theme';
import Header from '../../../components/Header';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenLoader from '../../../components/FullScreenLoader';
import fonts from '../../../styles/fonts';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import { resetData, setData, setId, setPreviousScreen } from '../../../redux/generalSlice';
import CustomTextInput from '../../../components/TextInputComponent';
import { getAllEvents } from '../../../redux/EventSlices/getAllEventsSlice';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import ListItem from '../../../components/ListItem';
const GRID_COLUMNS = 2;

const Events = ({ navigation }) => {
    const dispatch = useDispatch();
    const { events, loading, currentPage, totalPages } = useSelector((state) => state.getAllEvents);
    const { user_id } = useSelector((state) => state.auth);
    const { data } = useSelector((state) => state.general);
    const isFocused = useIsFocused();
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const handleEventCreation = () => {
        resetNavigation(navigation, SCREENS.EVENT_CREATION)
    }

    useFocusEffect(
        useCallback(() => {
            dispatch(getAllEvents({ page, limit: 10, searchPayload: { userId: user_id, search: searchTerm, club_id: data?.clubId } }));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dispatch, page, searchTerm])
    );

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1)
        dispatch(getAllEvents({ page: 1, limit: 10, searchPayload: { userId: user_id, search: searchTerm, club_id: data?.clubId } }))
            .then(() => setRefreshing(false))
            .catch(() => setRefreshing(false));
    };

    // useEffect(() => {
    //     if (!isFocused) {
    //         console.log('Test')
    //         setPage(1)
    //         dispatch(resetData())
    //     }
    // }, [isFocused, dispatch]);


    const handleLoadMore = useCallback(() => {
        if (currentPage < totalPages && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [currentPage, totalPages, loading]);

    const handleEventDetail = (clubID) => {
        dispatch(setId(clubID));
        dispatch(setPreviousScreen(SCREENS.MAIN_DASHBOARD));
        resetNavigation(navigation, SCREENS.EVENT_DETAIL)
    }
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
                title={"My Club Events"}
                firstIconName={isGridView ? "view-grid-outline" : "format-list-bulleted"}
                firstIconColor={theme.colors.labelColors}
                secondIconName={"add-circle"}
                secondIconColor={theme.colors.secondary}
                onSecondIconPress={handleEventCreation}
                onFirstIconPress={() => setIsGridView(!isGridView)}
            />

            <View style={{ padding: 20, marginTop: -25 }}>
                <CustomTextInput
                    identifier={'search'}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    placeholder={'Search...'} />
            </View>


            {loading && page == 1 && !refreshing ? showLoader() :
                events?.length > 0 ? (
                    <FlatList
                        key={isGridView ? 'grid' : 'list'}
                        data={events}
                        renderItem={({ item, index }) => (
                            <ListItem
                                item={item}
                                index={index}
                                isGridView={isGridView}
                                handleItemPress={handleEventDetail}
                                isTag={true}
                            />
                        )}
                        keyExtractor={(item, index) => item?.id.toString() + index}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        numColumns={isGridView ? GRID_COLUMNS : 1}
                        contentContainerStyle={styles.list}
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
                    />
                ) : (
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
        justifyContent: 'space-between',
        marginHorizontal: 10
    },
    itemContainer: {
        width: scaleWidth(160),
        flex: 1,
        margin: 10,
        borderRadius: 16,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    name: {
        fontFamily: fonts.fontsType.semiBold,
        fontSize: scaleHeight(14),
        color: theme.colors.white,
        marginTop: 5,
        flex: 1,
        alignSelf: 'center',
    },
    rating: {
        fontFamily: fonts.fontsType.regular,
        fontSize: scaleHeight(12),
        color: theme.colors.labelColors,
        marginTop: 8,
        marginEnd: 10,
        alignSelf: 'center',
        marginHorizontal: 2
    },
    description: {
        fontFamily: fonts.fontsType.medium,
        fontSize: scaleHeight(12),
        color: theme.colors.labelColors,
    },
    listContainer: {
        alignItems: 'center',
    },
    gridContainer: {
        justifyContent: 'space-between',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    tagStyle: {
        borderRadius: 10,
        padding: 8,
        position: 'absolute',
        top: scaleHeight(110),
        right: 10,
    },
    tagLabel: {
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(12),
        color: theme.colors.white
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        backgroundColor: theme.colors.transparent
    }
});

export default Events;
