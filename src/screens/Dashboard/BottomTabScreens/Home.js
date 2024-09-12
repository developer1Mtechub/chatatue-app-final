import React, { Component, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import theme from '../../../styles/theme';
import Header from '../../../components/Header';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getAllClubs } from '../../../redux/ClubCreation/getAllClubsSlice';
import FullScreenLoader from '../../../components/FullScreenLoader';
import * as Animatable from 'react-native-animatable';
import fonts from '../../../styles/fonts';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import { setData, setId, setPreviousScreen } from '../../../redux/generalSlice';
import CustomTextInput from '../../../components/TextInputComponent';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ListItem from '../../../components/ListItem';
import { getAllEvents } from '../../../redux/EventSlices/getAllEventsSlice';
import Contacts from 'react-native-contacts';
import ContactItems from '../../../components/ContactItems';
const { width } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const ITEM_MARGIN = 10;

const Home = ({ navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { clubs, loading, currentPage, totalPages } = useSelector((state) => state.getAllClubs);
    const { events, loading: eventLoader } = useSelector((state) => state.getAllEvents);
    const { user_id, userLoginInfo } = useSelector((state) => state.auth);
    const { profile_image } = userLoginInfo || {}
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClubCreationPress = () => {
        resetNavigation(navigation, SCREENS.CLUB_CREATION)
    }

    useFocusEffect(
        useCallback(() => {
            dispatch(getAllClubs({ page, limit: 10, searchPayload: { searcher_id: user_id, search: searchTerm } }));
            dispatch(getAllEvents({ page, limit: 10, searchPayload: { userId: user_id, search: searchTerm } }));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dispatch, page, searchTerm])
    );

    useEffect(() => {
        if (!isFocused) {
            setPage(1)
        }
    }, [isFocused]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        dispatch(getAllEvents({ page: 1, limit: 10, searchPayload: { userId: user_id, search: searchTerm } }));
        dispatch(getAllClubs({ page: 1, limit: 10, searchPayload: { searcher_id: user_id, search: searchTerm } }))
            .then(() => setRefreshing(false))
            .catch(() => setRefreshing(false));
    };

    const handleLoadMore = useCallback(() => {
        if (currentPage < totalPages && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [currentPage, totalPages, loading]);

    const handleClubNavigation = (clubID) => {
        dispatch(setId(clubID));
        dispatch(setPreviousScreen(SCREENS.MAIN_DASHBOARD));
        resetNavigation(navigation, SCREENS.CLUB_DETAIL)
    }

    const handleEventDetail = (eventId) => {
        dispatch(setId(eventId));
        dispatch(setPreviousScreen(SCREENS.MAIN_DASHBOARD));
        resetNavigation(navigation, SCREENS.EVENT_DETAIL)
    }

    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    const showEventLoader = () => {
        return <FullScreenLoader
            loading={eventLoader} />;
    };

    const showFooterSpinner = () => {
        return <FullScreenLoader
            indicatorSize={40}
            loading={loading} />;
    }


    return (
        <SafeAreaView style={styles.container}>
            <Header
                isOtherIcon={true}
                secondIconName={isGridView ? "view-grid-outline" : "format-list-bulleted"}
                secondIconColor={theme.colors.labelColors}
                firstIconName={"bell"}
                firstIconColor={theme.colors.secondary}
                onSecondIconPress={() => setIsGridView(!isGridView)}
                onFirstIconPress={handleClubCreationPress}
                isProfile={true}
                profileUri={profile_image?.url}
            />

            <View style={{ padding: 20, marginTop: -25 }}>
                <CustomTextInput
                    identifier={'search'}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    placeholder={'Search...'} />
            </View>

            <ScrollView>


                <View style={styles.labelValueStyle}>
                    <Text style={[styles.defaultLabelStyle]}>{"Clubs"}</Text>
                    <Text style={[styles.defaultValueStyle]}>{"See all"}</Text>
                </View>


                {loading && page == 1 && !refreshing ? showLoader() :
                    clubs?.length > 0 ? (
                        <FlatList
                            key={isGridView ? 'grid' : 'list'}
                            data={clubs?.slice(0, 4)}
                            renderItem={({ item, index }) => (
                                <ListItem
                                    item={item}
                                    index={index}
                                    isGridView={isGridView}
                                    handleItemPress={handleClubNavigation}
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

                <View style={[styles.labelValueStyle, { marginTop: 30 }]}>
                    <Text style={[styles.defaultLabelStyle]}>{"Events"}</Text>
                    <Text style={[styles.defaultValueStyle]}>{"See all"}</Text>
                </View>

                {
                    eventLoader && page == 1 && !refreshing ? showEventLoader() : events?.length > 0 &&
                        <FlatList
                            key={isGridView ? 'event_grid' : 'event_list'}
                            data={events?.slice(0, 4)}
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
                }


                <View style={[styles.labelValueStyle, { marginTop: 30 }]}>
                    <Text style={[styles.defaultLabelStyle]}>{"Suggested Contacts"}</Text>
                    <Text style={[styles.defaultValueStyle]}>{"See all"}</Text>
                </View>

                <ContactItems />

            </ScrollView>

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
    labelValueStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scaleHeight(5),
        marginTop: scaleHeight(10),
        marginHorizontal: 25
    },
    defaultLabelStyle: {
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.white,
    },
    defaultValueStyle: {
        color: theme.colors.textHeading,
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.regular,

    },
});

export default Home;
