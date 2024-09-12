import React, { Component, useEffect, useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, View, FlatList, Dimensions, Image, Text, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../../components/Header';
import theme from '../../../styles/theme';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import ProfileComponent from '../../../components/ProfileComponent';
import fonts from '../../../styles/fonts';
import RulesGoalsComponent from '../../../components/RulesGoalsComponent';
import InterestList from '../../../components/InterestList';
import { resetNavigation } from '../../../utils/resetNavigation';
import useBackHandler from '../../../utils/useBackHandler';
import { SCREENS } from '../../../constant/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getClubDetail } from '../../../redux/ClubCreation/getClubDetailSlice';
import FullScreenLoader from '../../../components/FullScreenLoader';
import ActionSheet from '../../../components/ActionSheet';
import Button from '../../../components/ButtonComponent';
import { resetData, setData, setId, setPreviousScreen } from '../../../redux/generalSlice';
import { deleteClub } from '../../../redux/ClubCreation/deleteClubSlice';
import { useAlert } from '../../../providers/AlertContext';
import { createDelayedNavigation } from '../../../utils/navigationWithDelay';
import CustomModal from '../../../components/CustomModal';
import { warningImg } from '../../../assets/images';
import ClubMember from '../../../components/ClubMember';
import { openPaymentSheet } from '../../../utils/paymentUtils';
import { sendMembershipRequest } from '../../../redux/ManageClub/sendMembershipRequestSlice';
import { getClubMembers } from '../../../redux/ManageClub/getClubMembersSlice';
import { getAllClubPostFeeds } from '../../../redux/ClubCreation/getAllClubPostFeedsSlice';
import { removeClubMember } from '../../../redux/ManageClub/removeClubMemberSlice';
import { getAllRoutes } from '../../../redux/ClubCreation/getAllRoutesSlice';
import { setRoutes } from '../../../redux/setEventRoutesSlice';
import ListItem from '../../../components/ListItem';
import CustomSheet from '../../../components/CustomSheet';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const { width } = Dimensions.get('window');

const ClubDetail = ({ navigation }) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { clubDetail, loading } = useSelector((state) => state.getClubDetail)
    const { clubPosts } = useSelector((state) => state.getAllClubPostFeeds);
    // const { clubMembers } = useSelector((state) => state.getClubMembers)
    const [clubMembers, setClubMembers] = useState([]);
    const { loading: deleteLoader } = useSelector((state) => state.deleteClub)
    const { loading: removeMemberLoader } = useSelector((state) => state.removeClubMember);
    const { loading: membershipLoader } = useSelector((state) => state.sendMembershipRequest);
    const { user_id, role } = useSelector((state) => state.auth)
    const clubId = useSelector((state) => state.general?.id)
    const { data } = useSelector((state) => state.general)
    const [activeIndex, setActiveIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [addedRoutes, setAddedRoutes] = useState([]);
    const [highlights, setHighlights] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const refRBSheet = useRef();
    const highlightSheet = useRef();
    const backToDashboard = createDelayedNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.CLUBS })

    const isUserClubMember = clubMembers?.some(member => member?.user_id === user_id);
    const hasAccess = user_id === clubDetail?.creator?.id || role === "ADMIN";
    const filteredRoutes = addedRoutes?.filter(item => item.club_id === clubId);

    const handleBackPress = () => {
        dispatch(resetData())
        resetNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.CLUBS })
        return true;
    }

    useBackHandler(handleBackPress)

    useEffect(() => {
        dispatch(getClubDetail(clubId))
        dispatch(getClubMembers({ clubId })).then((result) => {
            setClubMembers([])
            if (result?.payload?.success === true) {
                setClubMembers(result?.payload.result?.members)
            }
        })
        dispatch(getAllClubPostFeeds({ page: 1, limit: 10, searchPayload: { clubId: clubId } }));
        dispatch(getAllRoutes({ page: 1, limit: 10 })).then((result) => {
            const { routes } = result?.payload.result
            setAddedRoutes(routes)
        })

    }, [dispatch, clubId])

    const handleUpdateClub = () => {
        dispatch(setId(clubId))
        dispatch(setPreviousScreen(SCREENS.CLUB_DETAIL))
        resetNavigation(navigation, SCREENS.UPDATE_CLUB)
        refRBSheet.current.close()
    };

    const handleHighlightDetail = (item) => {
        setHighlights(item)
        highlightSheet?.current?.open();
    };

    const handleClubPostDetail = (postId) => {
        dispatch(setId(postId))
        dispatch(setPreviousScreen(SCREENS.CLUB_DETAIL))
        resetNavigation(navigation, SCREENS.CLUB_POST_DETAIL)
    };

    const handleViewProfile = () => {
        //dispatch(setId(clubDetail?.creator?.id))
        dispatch(setData({
            clubId,
            userId: clubDetail?.creator?.id
        }))
        dispatch(setPreviousScreen(SCREENS.CLUB_DETAIL))
        resetNavigation(navigation, SCREENS.VIEW_PROFILE)
    }

    const handleViewSchedule = () => {
        dispatch(setData({
            clubId,
            userId: clubDetail?.creator?.id
        }))
        resetNavigation(navigation, SCREENS.SCHEDULE)
    }

    const navigateToViewRoute = () => {
        if (filteredRoutes?.length === 0) {
            showAlert("Error", "error", "This club has no routes.")
            return
        }
        dispatch(setRoutes(filteredRoutes))
        dispatch(setData({
            previousScreen: SCREENS.CLUB_DETAIL
        }))
        resetNavigation(navigation, SCREENS.ROUTE)
    }

    const handleClubEventCreation = () => {
        dispatch(setData({ clubId }))
        dispatch(setPreviousScreen(SCREENS.CLUB_DETAIL))
        resetNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.EVENTS })
    }

    const handleDeleteClub = () => {
        dispatch(deleteClub(clubId)).then((result) => {
            if (result?.payload?.success === true) {
                handleCloseModal();
                showAlert("Success", "success", result?.payload?.message)
                backToDashboard();
            } else if (result?.payload?.error?.success === false) {
                showAlert("Error", "error", result?.payload?.error?.message)
            }

        })
    };

    const handleRemoveMemberRole = (memberId) => {
        dispatch(removeClubMember(memberId)).then((result) => {
            const { success, message } = result?.payload
            if (success) {
                showAlert("Success", "success", message)
                handleBackPress();
            } else if (!success) {
                showAlert("Error", "error", message)
            }
        })
    }

    const handleOpenModal = () => {
        setModalVisible(true);
        refRBSheet.current.close()
    };

    const sheetItems = [
        { id: 1, label: 'Update Club', onPress: handleUpdateClub },
        { id: 2, label: 'Delete Club', onPress: handleOpenModal }
    ];

    const handleManageMembers = () => {
        dispatch(setId(clubId))
        dispatch(setPreviousScreen(SCREENS.CLUB_DETAIL))
        resetNavigation(navigation, SCREENS.MANAGE_MEMBERS)
    };


    const handleClubFeeds = () => {
        dispatch(setId(clubId))
        const data = {
            clubId,
            userId: clubDetail?.user_id
        }
        dispatch(setData(data))
        dispatch(setPreviousScreen(SCREENS.CLUB_DETAIL))
        resetNavigation(navigation, SCREENS.CLUB_FEEDS)
    };


    const handleJoinClub = () => {
        const membershipRequest = {
            club_id: clubId,
            user_id: user_id
        }
        dispatch(sendMembershipRequest(membershipRequest)).then((result) => {
            const { success, message } = result?.payload
            if (success) {
                showAlert("Success", "success", message)
            } else if (!success) {
                showAlert("Error", "error", message)
            }
        })
    }

    const handleCloseModal = () => {
        setModalVisible(false);
    };


    const renderItem = ({ item, index }) => (
        <View style={[styles.carouselItem]}>
            <Image source={{ uri: item?.url }} style={styles.carouselImage} />
        </View>
    );

    const renderHighligtsItem = ({ item }) => (
        <ClubMember
            isPress={false}
            onPress={() => { handleHighlightDetail(item) }}
            avatarUrl={item?.images[0]?.url}
            customImageStyle={styles.customImage}
        />
    );

    const renderPostItem = ({ item }) => (
        <View style={[styles.itemContainer, { flex: 0, width: scaleWidth(160) }]}>
            <TouchableOpacity
                style={{
                    height: scaleHeight(160),
                }}
                onPress={() => {
                    (hasAccess || isUserClubMember) && handleClubPostDetail(item?.id);
                }}>
                <Image source={{ uri: item?.images[0]?.url }} style={styles.image} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.name}>
                    {item?.title}
                </Text>
            </View>
            <Text numberOfLines={2} ellipsizeMode='tail' style={styles.description}>{item?.description}</Text>
        </View>
    );

    const renderEventItem = ({ item }) => (
        <View style={[styles.itemContainer, { flex: 0, width: scaleWidth(160) }]}>
            <TouchableOpacity
                style={{
                    height: scaleHeight(160),
                }}
                onPress={() => {
                    // handleClubNavigation(item?.id);
                }}>
                <Image source={{ uri: item?.images[0]?.url }} style={styles.image} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.name}>
                    {item?.name}
                </Text>
            </View>
            <Text numberOfLines={2} ellipsizeMode='tail' style={styles.description}>{item?.description}</Text>
        </View>
    );


    const handleSelectionChange = (selectedCategories) => {
        setSelectedCategories(selectedCategories);
    };

    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    const RenderHighlight = ({ item, index }) => {
        return (

            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 30
            }}>
                <FastImage
                    source={{ uri: item?.url, priority: FastImage.priority.high }}
                    style={styles.sliderImage}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </View>
        )
    };

    const onSnapToItem = (index) => {
        setActiveSlide(index);
    };

    const renderHighlightSheet = () => {
        return (
            <CustomSheet
                ref={highlightSheet}
                isHeader={true}
                title={"Highlight"}
                customStyles={{
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                }}
            >

                <View>
                    <Carousel
                        data={highlights?.images}
                        renderItem={({ item, index }) => <RenderHighlight item={item} index={index} />}
                        sliderWidth={width}
                        itemWidth={width * 0.8}
                        layout={'default'}
                        //activeSlideAlignment={'center'}
                        // inactiveSlideScale={0.9}
                        // inactiveSlideOpacity={0.7}
                        loop={false}
                        pagingEnabled
                        onSnapToItem={onSnapToItem}
                    />
                    <Pagination
                        dotsLength={highlights?.images?.length}
                        activeDotIndex={activeSlide}
                        containerStyle={styles.paginationContainer}
                        dotStyle={styles.dot2}
                        inactiveDotStyle={styles.inactiveDot}
                        inactiveDotOpacity={0.4}
                        inactiveDotScale={0.6}
                    />

                </View>

                <View style={styles.containerHighlight}>
                    <Text style={styles.count}>
                        {`${activeSlide + 1} / ${highlights?.images?.length}`}
                    </Text>
                </View>

                <View style={{ marginTop: '-35%' }}>
                    <Text style={styles.higlightTitle}>
                        {highlights?.title}
                    </Text>
                    <Text style={styles.highlightDescription}>
                        Description
                    </Text>

                    <Text style={styles.highlightDesValue}>
                        {highlights?.description}
                    </Text>
                </View>




            </CustomSheet>
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <Header
                onBackPress={handleBackPress}
                isBackIcon={true}
                title={"Club Detail"}
                firstIconName="chat-processing-outline"
                firstIconColor={theme.colors.labelColors}
                {
                ...(
                    (user_id === clubDetail?.creator?.id || role === "ADMIN") && {

                        secondIconName: "more-vert",
                        secondIconColor: theme.colors.secondary,
                        onSecondIconPress: () => { refRBSheet.current.open() }
                    }
                )
                }

            />

            {
                loading ? showLoader() : <ScrollView>

                    <View>
                        <FlatList
                            data={clubDetail?.images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                                setActiveIndex(index);
                            }}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                        />


                        <View style={styles.dotContainer}>
                            {clubDetail?.images?.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        index === activeIndex && styles.activeIndicator,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ marginTop: scaleHeight(-10), marginHorizontal: 20 }}>
                        <Text style={styles.clubName}>{clubDetail?.name}</Text>

                        <Text style={styles.clubHighlight}>{"Club Highlights"}</Text>

                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={clubDetail?.highlights?.slice(0, 5)}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderHighligtsItem}
                            contentContainerStyle={{
                                justifyContent: 'space-around',
                            }}
                            style={{ marginBottom: 20 }}
                        />

                        <ProfileComponent
                            avatarUrl={clubDetail?.creator?.profile_image?.url}
                            name={clubDetail?.creator?.username}
                            rating={clubDetail?.creator?.rating}
                            onViewProfile={handleViewProfile}
                        />

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                About
                            </Text>

                            <Text style={{
                                color: theme.colors.labelColors,
                                fontSize: scaleHeight(14),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                {`${clubDetail?.members?.length} Joined`}
                            </Text>

                        </View>

                        <Text style={{
                            color: theme.colors.labelColors,
                            fontSize: scaleHeight(15),
                            fontFamily: fonts.fontsType.light,
                            marginBottom: scaleHeight(10),
                            marginHorizontal: 10
                        }}>
                            {clubDetail?.description}
                        </Text>

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                Club Fee
                            </Text>

                            <Text style={{
                                color: theme.colors.textHeading,
                                fontSize: scaleHeight(14),
                                fontFamily: fonts.fontsType.bold,

                            }}>
                                {`$${clubDetail?.fee}` || 'This is free club'}
                            </Text>

                        </View>

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                Rules
                            </Text>

                            <Text style={{
                                color: theme.colors.textHeading,
                                fontSize: scaleHeight(14),
                                fontFamily: fonts.fontsType.bold,

                            }}>
                                See All
                            </Text>

                        </View>

                        <RulesGoalsComponent
                            data={clubDetail?.rules}
                        />

                        <View style={{ marginBottom: 20 }}>
                            <InterestList
                                interests={clubDetail?.categories}
                                onSelectionChange={handleSelectionChange}
                                test={true}
                            />
                        </View>


                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                Goals
                            </Text>

                            <Text style={{
                                color: theme.colors.textHeading,
                                fontSize: scaleHeight(14),
                                fontFamily: fonts.fontsType.bold,

                            }}>
                                See All
                            </Text>

                        </View>

                        <RulesGoalsComponent
                            data={clubDetail?.goals}
                            iconColor={theme.colors.textHeading}
                            iconName='radiobox-marked'
                        />


                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                Schedules
                            </Text>

                            <TouchableOpacity
                                onPress={() => {
                                    handleViewSchedule()
                                }}
                            >
                                <Text style={{
                                    color: theme.colors.textHeading,
                                    fontSize: scaleHeight(14),
                                    fontFamily: fonts.fontsType.bold,

                                }}>
                                    View
                                </Text>
                            </TouchableOpacity>

                        </View>

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                Routes
                            </Text>

                            <TouchableOpacity
                                onPress={navigateToViewRoute}
                            >
                                <Text style={{
                                    color: theme.colors.textHeading,
                                    fontSize: scaleHeight(14),
                                    fontFamily: fonts.fontsType.bold,

                                }}>
                                    View
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                {`Club Members (${clubMembers?.length})`}
                            </Text>


                            {(hasAccess || isUserClubMember) && <TouchableOpacity
                                onPress={handleManageMembers}
                            >

                                <Text style={{
                                    color: theme.colors.textHeading,
                                    fontSize: scaleHeight(14),
                                    fontFamily: fonts.fontsType.bold,

                                }}>
                                    See All
                                </Text>

                            </TouchableOpacity>}

                        </View>
                        <ScrollView showsHorizontalScrollIndicator={false} horizontal style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                                {clubMembers?.map((member, index) => (
                                    <ClubMember
                                        key={index}
                                        avatarUrl={member?.user_details?.profile_image?.url}
                                        memberName={member?.user_details?.username?.split(' ')[0]}
                                        customImageStyle={{
                                            width: 50,
                                            height: 50,
                                        }}
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                {`Club Posts (${clubPosts?.length || 0})`}
                            </Text>


                            {(hasAccess || isUserClubMember) && <TouchableOpacity
                                onPress={handleClubFeeds}
                            >

                                <Text style={{
                                    color: theme.colors.textHeading,
                                    fontSize: scaleHeight(14),
                                    fontFamily: fonts.fontsType.bold,

                                }}>
                                    See All
                                </Text>

                            </TouchableOpacity>}

                        </View>

                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={clubPosts?.slice(0, 5)}  // Show only first 5 posts
                            keyExtractor={(item, index) => index.toString()}
                            // renderItem={renderPostItem}
                            renderItem={({ item, index }) => (
                                <ListItem
                                    item={item}
                                    index={index}
                                    isGridView={true}
                                    handleItemPress={() => {
                                        (hasAccess || isUserClubMember) && handleClubPostDetail(item?.id)
                                    }}
                                />
                            )}
                            contentContainerStyle={{
                                justifyContent: 'space-around',
                            }}
                            style={{ marginBottom: 20 }}
                        />


                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                {`Club Events (${clubDetail?.events?.length || '0'})`}
                            </Text>


                            {(hasAccess || isUserClubMember) && <TouchableOpacity
                                onPress={handleClubEventCreation}
                            >
                                <Text style={{
                                    color: theme.colors.textHeading,
                                    fontSize: scaleHeight(14),
                                    fontFamily: fonts.fontsType.bold,

                                }}>
                                    See All
                                </Text>

                            </TouchableOpacity>}

                        </View>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={clubDetail?.events?.slice(0, 5)}  // Show only first 5 events
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderEventItem}
                            contentContainerStyle={{
                                justifyContent: 'space-around',
                            }}
                            style={{ marginBottom: 20 }}
                        />

                    </View>
                    {user_id !== clubDetail?.creator?.id &&
                        <Button
                            loading={membershipLoader}
                            title={'Join Club'}
                            onPress={() => {
                                clubDetail?.is_paid != null || clubDetail?.is_paid ?
                                    openPaymentSheet(100, handleJoinClub, 'Test User', user_id) :
                                    handleJoinClub()
                            }}
                        />}

                    {(data?.type === 'joined' && user_id !== clubDetail?.creator?.id) ||
                        (isUserClubMember && user_id !== clubDetail?.creator?.id) &&
                        <Button
                            loading={removeMemberLoader}
                            title={'Leave Club'}
                            // onPress={() => { handleRemoveMemberRole(clubDetail?.user_id) }}
                            onPress={() => { handleRemoveMemberRole(user_id) }}
                            customStyle={{ backgroundColor: theme.colors.error }}
                        />}
                </ScrollView>
            }

            <ActionSheet
                ref={refRBSheet}
                sheetItems={sheetItems}
            />
            <CustomModal
                loading={deleteLoader}
                isVisible={modalVisible}
                onClose={handleCloseModal}
                headerTitle={"Delete Club?"}
                imageSource={warningImg}
                isParallelButton={true}
                text={`Do you really want to delete club?`}
                parallelButtonText1={"Cancel"}
                parallelButtonText2={"Yes, Delete"}
                parallelButtonPress1={() => {
                    handleCloseModal()
                }}
                parallelButtonPress2={() => {
                    handleDeleteClub()
                }}
            />

            {renderHighlightSheet()}

        </SafeAreaView>
        // </StripeProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    carouselItem: {
        width: scaleWidth(375),
        height: scaleHeight(260),
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselImage: {
        width: '85%',
        height: '75%',
        borderRadius: 20,
        alignSelf: 'center'
    },
    dotContainer: {
        position: 'absolute',
        top: scaleHeight(200),
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dot: {
        width: 20,
        height: 5,
        borderRadius: 5,
        backgroundColor: 'white',
        marginHorizontal: 5,
        alignSelf: 'center'
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 5,
        backgroundColor: theme.colors.inputBg,
        marginHorizontal: 5,
        //borderWidth: 1,
        borderColor: theme.colors.textHeading
    },
    activeIndicator: {
        width: 24,
        height: 8,
        borderRadius: 5,
        backgroundColor: theme.colors.textHeading,
    },
    clubName: {
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.white,
        marginHorizontal: 10,
        marginBottom: 20
    },

    clubHighlight: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.white,
        marginHorizontal: 10,
        marginBottom: 10
    },
    clubHighlight2: {
        fontSize: normalizeFontSize(12),
        fontFamily: fonts.fontsType.light,
        color: theme.colors.labelColors,
        marginHorizontal: 10,
        marginBottom: 20,
        width: '100%'
    },
    aboutStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scaleHeight(5),
        marginTop: scaleHeight(10),
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
    description: {
        fontFamily: fonts.fontsType.medium,
        fontSize: scaleHeight(12),
        color: theme.colors.labelColors,
    },
    customImage: {
        marginBottom: 0,
        width: 100,
        height: 100,
    },
    paginationContainer: {
        paddingVertical: 8,
        position: 'absolute',
        bottom: '22%',
        alignSelf: 'center'
    },
    dot2: {
        width: 8,
        height: 8,
        borderRadius: 10,
        backgroundColor: theme.colors.textHeading,
    },
    inactiveDot: {
        width: 12,
        height: 12,
        borderRadius: 10,
        backgroundColor: '#bbb',
    },
    higlightTitle: {
        color: theme.colors.white,
        fontSize: scaleHeight(18),
        fontFamily: fonts.fontsType.bold,

    },
    highlightDescription: {
        color: theme.colors.white,
        fontSize: scaleHeight(16),
        fontFamily: fonts.fontsType.medium,
        marginTop: 20
    },
    highlightDesValue: {
        color: theme.colors.labelColors,
        fontSize: scaleHeight(15),
        fontFamily: fonts.fontsType.light,
        marginBottom: scaleHeight(10),
    },
    count: {
        color: theme.colors.black,
        fontSize: scaleHeight(14),
        fontFamily: fonts.fontsType.bold,
    },
    containerHighlight: {
        alignItems: 'center',
        marginVertical: 10,
        position: 'absolute',
        bottom: '34%',
        right: 20,
        backgroundColor: theme.colors.textHeading,
        borderRadius: 50,
        paddingHorizontal: 10,
        height: 30,
        justifyContent: 'center'
    },
    sliderImage: {
        height: '80%',
        width: '90%',
        borderRadius: 16
    }
});

export default ClubDetail;
