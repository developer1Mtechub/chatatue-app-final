import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import { getAllClubs } from '../../../redux/ClubCreation/getAllClubsSlice';
import { setData, setId, setPreviousScreen } from '../../../redux/generalSlice';
import { scaleHeight, scaleWidth } from '../../../styles/responsive';
import FullScreenLoader from '../../../components/FullScreenLoader';
import Header from '../../../components/Header';
import theme from '../../../styles/theme';
import CustomTextInput from '../../../components/TextInputComponent';
import fonts from '../../../styles/fonts';
import { joinedClubs } from '../../../redux/ClubCreation/joinedClubsSlice';
import useBackHandler from '../../../utils/useBackHandler';
import ListItem from '../../../components/ListItem';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const ITEM_MARGIN = 10;

const JoinedClub = ({ navigation }) => {
    const dispatch = useDispatch();
    const { joinClubs, loading, currentPage, totalPages } = useSelector((state) => state.joinedClubs);
    const { user_id } = useSelector((state) => state.auth);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [loader, setLoader] = useState(true);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.CLUBS })
        return true;
    }
    useBackHandler(handleBackPress)

    const handleClubCreationPress = () => {
        resetNavigation(navigation, SCREENS.CLUB_CREATION)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoader(false);
        }, 1000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        dispatch(joinedClubs({ page, limit: 10, searchPayload: { user_id: user_id, search: searchTerm } }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, page, searchTerm]);

    const onRefresh = () => {
        setRefreshing(true);
        dispatch(joinedClubs({ page: 1, limit: 10, searchPayload: { user_id: user_id, search: searchTerm } }))
            .then(() => setRefreshing(false))
            .catch(() => setRefreshing(false));
    };

    const handleLoadMore = () => {
        if (currentPage < totalPages && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleClubNavigation = (clubID) => {
        dispatch(setId(clubID));
        dispatch(setData({
            type: 'joined'
        }))
        dispatch(setPreviousScreen(SCREENS.MAIN_DASHBOARD));
        resetNavigation(navigation, SCREENS.CLUB_DETAIL)
    }

    const renderItem = ({ item, index }) => (
        <View
            style={[styles.itemContainer, { flex: isGridView ? 0 : 1, width: isGridView ? scaleWidth(160) : '95%', }]}>
            <TouchableOpacity
                style={{
                    height: isGridView ? scaleHeight(160) : scaleHeight(240),
                }}
                onPress={() => {
                    handleClubNavigation(item?.club_id)
                }}>
                <Image source={{ uri: item?.details?.images[0]?.url }} style={[styles.image]} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', }}>

                <Text
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    style={styles.name}>{item?.details?.name}</Text>
                {/* <Text style={styles.rating}>{item?.creator?.rating}</Text> */}

            </View>
            <Text numberOfLines={2} ellipsizeMode='tail' style={styles.description}>{item?.details?.description}</Text>
        </View>
    );

    const showLoader = () => {
        return <FullScreenLoader
            loading={loader} />;
    };

    const showFooterSpinner = () => {
        return <FullScreenLoader
            indicatorSize={40}
            loading={loading} />;
    }


    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={"Joined Clubs"}
                firstIconName={isGridView ? "view-grid-outline" : "format-list-bulleted"}
                firstIconColor={theme.colors.labelColors}
                secondIconName={"add-circle"}
                secondIconColor={theme.colors.secondary}
                onSecondIconPress={handleClubCreationPress}
                onFirstIconPress={() => setIsGridView(!isGridView)}
                isBackIcon={true}
                onBackPress={handleBackPress}
            />

            {/* <View style={{ padding: 20, marginTop: -25 }}>
                <CustomTextInput
                    identifier={'search'}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    placeholder={'Search...'} />
            </View> */}


            {loader && !refreshing ? showLoader() :
                joinClubs?.length > 0 ? (
                    <FlatList
                        key={isGridView ? 'grid' : 'list'}
                        data={joinClubs}
                        // renderItem={renderItem}
                        renderItem={({ item, index }) => (
                            <ListItem
                                item={item}
                                index={index}
                                isGridView={isGridView}
                                handleItemPress={() => {
                                    handleClubNavigation(item?.club_id)
                                }}
                            />
                        )}
                        keyExtractor={(item, index) => item + index}
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
});

export default JoinedClub;
