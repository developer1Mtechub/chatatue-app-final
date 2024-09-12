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
import { scaleHeight, scaleWidth } from '../../../styles/responsive';
import { setData, setId, setPreviousScreen } from '../../../redux/generalSlice';
import CustomTextInput from '../../../components/TextInputComponent';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ListItem from '../../../components/ListItem';
const { width } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const ITEM_MARGIN = 10;

const Home = ({ navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { clubs, loading, currentPage, totalPages } = useSelector((state) => state.getAllClubs);
    const { user_id } = useSelector((state) => state.auth);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClubCreationPress = () => {
        resetNavigation(navigation, SCREENS.CLUB_CREATION)
    }


    useFocusEffect(
        useCallback(() => {
            dispatch(getAllClubs({ page, limit: 10, searchPayload: { search: searchTerm } }));
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
        dispatch(getAllClubs({ page: 1, limit: 10, searchPayload: { search: searchTerm } }))
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
                title={"Clubs"}
                firstIconName={isGridView ? "view-grid-outline" : "format-list-bulleted"}
                firstIconColor={theme.colors.labelColors}
                secondIconName={"add-circle"}
                secondIconColor={theme.colors.secondary}
                onSecondIconPress={handleClubCreationPress}
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
                clubs?.length > 0 ? (
                    <FlatList
                        key={isGridView ? 'grid' : 'list'}
                        data={clubs}
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
});

export default Home;
