import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList, ScrollView, RefreshControl } from 'react-native';
import Header from '../../../components/Header';
import theme from '../../../styles/theme';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import useBackHandler from '../../../utils/useBackHandler';
import fonts from '../../../styles/fonts';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import More from 'react-native-vector-icons/MaterialIcons';
import HorizontalDivider from '../../../components/HorizontalDivider';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersAchievements } from '../../../redux/EventSlices/getUsersAchievementSlice';
import FullScreenLoader from '../../../components/FullScreenLoader';
import RBSheet from 'react-native-raw-bottom-sheet';
import { CloseIcon } from '../../../assets/svgs';
import { setData } from '../../../redux/generalSlice';

const EventPerformance = ({ navigation }) => {
    const dispatch = useDispatch();
    const { achievements, loading, currentPage, totalPages } = useSelector((state) => state.getUsersAchievements);
    const { data } = useSelector((state) => state.general)
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const awradSheetRef = useRef();

    console.log(data)


    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.EVENT_DETAIL);
        return true;
    };

    useBackHandler(handleBackPress);

    useFocusEffect(
        useCallback(() => {
            dispatch(getUsersAchievements({ page, limit: 10, searchPayload: { event_id: data?.eventId } }));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dispatch, page])
    );

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1)
        dispatch(getUsersAchievements({ page: 1, limit: 10, searchPayload: { event_id: data?.eventId } }))
            .then(() => setRefreshing(false))
            .catch(() => setRefreshing(false));
    };


    const handleLoadMore = useCallback(() => {
        if (currentPage < totalPages && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [currentPage, totalPages, loading]);

    const navigateToAchievement = (achievementId) => {
        dispatch(setData({
            achievementId: achievementId,
            eventId: data?.eventId,
            previousScreen: SCREENS.EVENT_PERFORMANCE
        }))

        resetNavigation(navigation, SCREENS.USER_PERFORMANCE)
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



    const handlePress = useCallback(() => {
        awradSheetRef?.current?.open()
    }, []);


    const renderAwardBottomSheet = () => {
        return <RBSheet
            ref={awradSheetRef}
            height={400}
            openDuration={500}
            customStyles={{ container: styles.scheduleSheet, wrapper: styles.wrapper }}
            closeOnPressBack={true}
        >
            <View>
                <View style={{
                    flexDirection: 'row'
                }}>

                    <Text style={[styles.heading]}>
                        Assign Award
                    </Text>

                    <TouchableOpacity
                        style={styles.crossBtn}
                        onPress={() => {
                            awradSheetRef?.current?.close()
                        }}>
                        <CloseIcon width={24} height={24} />
                    </TouchableOpacity>

                </View>
            </View>


        </RBSheet>
    }


    const PerformanceList = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                navigateToAchievement(item?.id)
            }}
            style={styles.performanceListContainer}>
            <View style={styles.row}>
                <Image
                    style={styles.image}
                    source={{ uri: item?.profile_image?.url }}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{item?.user?.username}</Text>
                    {item?.badge?.badge_icon && <Icon name='trophy-award' size={28} color={theme.colors.textHeading} style={styles.icon} />}
                </View>
                <TouchableOpacity
                    onPress={handlePress}
                >
                    <More name='more-vert' size={28} color={theme.colors.white} style={styles.moreIcon} />
                </TouchableOpacity>
            </View>

            <View style={[styles.ratingContainer, styles.marginTop10]}>
                <View style={[styles.tagStyle, styles.clubTag]}>
                    <Text style={styles.tagText}>{`${item?.duration?.hours || '00'}:${item?.duration?.minutes || '00'}:${item?.duration?.seconds || '00'} Duration`}</Text>
                </View>
                <View style={[styles.tagStyle, styles.publicTag]}>
                    <Text style={styles.tagText}>{`${item?.pace} Min/km`}</Text>
                </View>
                <View style={[styles.tagStyle, styles.kcal]}>
                    <Text style={styles.tagText}>{`${item?.calories_burnt} kcal`}</Text>
                </View>
            </View>

            <HorizontalDivider customStyle={styles.horizontalDivider} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Performance"
                isBackIcon={true}
                onBackPress={handleBackPress}
            />
            {loading && page == 1 && !refreshing ? showLoader() :
                achievements?.length > 0 ? (<FlatList
                    data={achievements}
                    renderItem={PerformanceList}
                    keyExtractor={(item, index) => item.toString() + index}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={loading && !refreshing && (<View style={styles.footer}>
                        {showFooterSpinner()}
                    </View>)}
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
            {renderAwardBottomSheet()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    performanceListContainer: {
        marginHorizontal: 20,
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 45,
        height: 45,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: theme.colors.textHeading,
        top: scaleHeight(20),
    },
    infoContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        flex: 1,
    },
    nameText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(12),
        color: theme.colors.white,
        alignSelf: 'center',
    },
    icon: {
        marginHorizontal: 15,
    },
    moreIcon: {
        alignSelf: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        marginHorizontal: scaleWidth(48),
        justifyContent: 'space-between',
    },
    tagStyle: {
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    clubTag: {
        backgroundColor: '#BA20AE',
        marginRight: 10,
    },
    publicTag: {
        backgroundColor: theme.colors.error,
    },
    kcal: {
        backgroundColor: theme.colors.success,
        marginHorizontal: 10,
    },
    tagText: {
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(10),
        color: theme.colors.white,
    },
    marginTop10: {
        marginTop: 10,
    },
    horizontalDivider: {
        width: '80%',
        marginStart: 40,
        height: 1.5,
        marginTop: 15,
    },
    scheduleSheet: {
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    heading: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(18),
        color: theme.colors.white,
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20

    },
    crossBtn: {
        alignSelf: 'flex-end',
        marginEnd: 20

    },
    wrapper: {
        backgroundColor: theme.colors.backDropColor
    }
});

export default EventPerformance;
