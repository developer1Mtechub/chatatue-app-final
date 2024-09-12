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
import { setData, setId, setPreviousScreen } from '../../../redux/generalSlice';
import { deleteClub } from '../../../redux/ClubCreation/deleteClubSlice';
import { useAlert } from '../../../providers/AlertContext';
import { createDelayedNavigation } from '../../../utils/navigationWithDelay';
import CustomModal from '../../../components/CustomModal';
import { warningImg } from '../../../assets/images';
import ClubMember from '../../../components/ClubMember';
import { openPaymentSheet } from '../../../utils/paymentUtils';
import { sendMembershipRequest } from '../../../redux/ManageClub/sendMembershipRequestSlice';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_KEY } from '@env'
import { getClubMembers } from '../../../redux/ManageClub/getClubMembersSlice';
import { getAllClubPostFeeds } from '../../../redux/ClubCreation/getAllClubPostFeedsSlice';
import { getEventDetail } from '../../../redux/EventSlices/getEventDetailSlice';
import { color } from 'react-native-reanimated';
import { getReviews } from '../../../redux/ReviewSlices/getReviewsSlice';
import ReviewList from '../../../components/ReviewList';
import { deleteEvent } from '../../../redux/EventSlices/deleteEventSlice';
import TextWithIcon from '../../../components/TextWithIcon';
import moment from 'moment';
import { joinEvent } from '../../../redux/EventSlices/jointEventSlice';
import { getInvitiesList } from '../../../redux/EventSlices/getInvitiesListSlice';
import InvitiesUserList from '../../../components/InvitiesUserList';
import { setRoutes } from '../../../redux/setEventRoutesSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const EventDetail = ({ navigation }) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { eventDetail, loading } = useSelector((state) => state.getEventDetail)
    const { reviews } = useSelector((state) => state.getReviews)
    const { invitiesList } = useSelector((state) => state.getInvitiesList)
    const { loading: deleteLoader } = useSelector((state) => state.deleteClub)
    const { user_id, role } = useSelector((state) => state.auth)
    const eventId = useSelector((state) => state.general?.id)
    const [activeIndex, setActiveIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const refRBSheet = useRef();
    const isEventJoined = eventDetail?.joinees?.some(member => member?.user_id === user_id);
    const buttonTitle = isEventJoined ? "Joined" : "Join Event";
    const backToDashboard = createDelayedNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.EVENTS })
    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.EVENTS })
        return true;
    }

    useBackHandler(handleBackPress)

    const handleUpdateEvent = () => {
        dispatch(setData({
            clubId: eventDetail?.club_id,
            eventId: eventId,
            userId: eventDetail?.creator?.id,
            type: 'event_update'
        }))

        resetNavigation(navigation, SCREENS.UPDATE_EVENT)
        refRBSheet.current.close()
    };


    const handleViewProfile = () => {
        // dispatch(setId(eventDetail?.creator?.id))
        // dispatch(setData({ eventId }))
        dispatch(setData({
            eventId: eventId,
            userId: eventDetail?.creator?.id
        }))
        dispatch(setPreviousScreen(SCREENS.EVENT_DETAIL))
        resetNavigation(navigation, SCREENS.VIEW_PROFILE)
    }


    const handleDeleteClub = () => {
        dispatch(deleteEvent(eventId)).then((result) => {
            if (result?.payload?.success === true) {
                showAlert("Success", "success", result?.payload?.message)
                backToDashboard();
            } else if (result?.payload?.error?.success === false) {
                showAlert("Error", "error", result?.payload?.error?.message)
            }

        })
    };

    const handleDuplicateEvent = () => {

        dispatch(setData({
            clubId: eventDetail?.club_id,
            eventId: eventId,
            userId: eventDetail?.creator?.id,
            type: 'event_duplicate'
        }))

        resetNavigation(navigation, SCREENS.EVENT_CREATION)

    }

    const handleOpenModal = () => {
        setModalVisible(true);
        refRBSheet.current.close()
    };

    const sheetItems = [
        { id: 3, label: 'Duplicate Event', onPress: handleDuplicateEvent },
        { id: 1, label: 'Update Event', onPress: handleUpdateEvent },
        { id: 2, label: 'Delete Event', onPress: handleOpenModal }
    ];


    const handleJoinEvent = () => {
        const joinEventPayload = {
            eventId: eventId,
            userId: user_id
        }
        dispatch(joinEvent(joinEventPayload)).then((result) => {
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

    useEffect(() => {
        dispatch(getEventDetail(eventId))
        dispatch(getReviews({ event_id: user_id, type: "EVENT" }))
        dispatch(getInvitiesList(eventId))

    }, [dispatch, eventId, user_id])

    const renderItem = ({ item, index }) => (
        <View style={[styles.carouselItem]}>
            <Image source={{ uri: item?.url }} style={styles.carouselImage} resizeMode="contain" />
        </View>
    );

    const handleSelectionChange = (selectedCategories) => {
        setSelectedCategories(selectedCategories);
    };



    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    const handleManageRSVP = () => {

        dispatch(setData({
            eventId: eventId,
            userId: eventDetail?.creator?.id,
            eventName: eventDetail?.name
        }))

        resetNavigation(navigation, SCREENS.MANAGE_PARTICIPANTS)

    }

    const navigateToEventRoutes = () => {
        if (eventDetail?.routes?.length > 0) {
            dispatch(setRoutes(eventDetail?.routes))
            dispatch(setData({ eventId: eventId }))
            resetNavigation(navigation, SCREENS.ROUTE)
        } else {
            showAlert("Error", "error", "Routes not available in this Event.")
        }

    }

    const navigateToEventAchievement = () => {
        dispatch(setData({ eventId: eventId, userId: user_id }))
        resetNavigation(navigation, SCREENS.EVENT_PERFORMANCE)
    }

    const navigateToActivities = () => {
        dispatch(setData({ eventId: eventId }))
        resetNavigation(navigation, SCREENS.EVENT_ACTIVITIES)
    }


    return (
        <SafeAreaView style={styles.container}>
            <Header
                onBackPress={handleBackPress}
                isBackIcon={true}
                title={eventDetail?.name}
                {...(role == 'ADMIN' || user_id == eventDetail?.host?.id && {
                    firstIconName: "chat-processing-outline",
                    firstIconColor: theme.colors.transparent,
                    secondIconName: "more-vert",
                    secondIconColor: theme.colors.secondary,
                    onSecondIconPress: () => {
                        refRBSheet.current.open();
                    }
                })}
            />

            {
                loading ? showLoader() : <ScrollView>

                    <View>
                        <FlatList
                            data={eventDetail?.images}
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
                            {eventDetail?.images?.map((_, index) => (
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

                    <View style={styles.contentContainer}>
                        <Text style={styles.clubName}>{eventDetail?.name}</Text>

                        <ProfileComponent
                            avatarUrl={eventDetail?.host?.profile_image?.url}
                            name={eventDetail?.host?.username}
                            rating={eventDetail?.host?.rating}
                            onViewProfile={handleViewProfile}
                        />

                        <View style={styles.aboutStyle}>


                            <Text style={styles.headingLabel}>
                                About Event
                            </Text>

                            <View style={[styles.tagStyle, { backgroundColor: eventDetail?.is_public ? theme.colors.success : theme.colors.tagColor, }]}>
                                <Text style={styles.tagLabel}>{eventDetail?.is_public ? 'Public' : 'Private'}</Text>
                            </View>

                        </View>

                        <Text style={styles.about}>
                            {eventDetail?.description}
                        </Text>

                        <TextWithIcon
                            iconName={'cash'}
                            text={`$${eventDetail?.amount}`}
                        />

                        <TextWithIcon
                            iconName={'calendar-month'}
                            text={moment(eventDetail?.start_date).format('dddd, MMM D YYYY')}
                            subText={moment(eventDetail?.start_time).format('hh:mm A')}
                        />

                        <TextWithIcon
                            iconName={'map-marker'}
                            text={eventDetail?.location}
                        />

                        <TextWithIcon
                            iconName={'map-marker-distance'}
                            text={`Distance ${eventDetail?.distance} (km)`}
                        />

                        <View style={styles.aboutStyle}>


                            <Text style={styles.headingLabel}>
                                Meeting Rules
                            </Text>

                            <Text style={styles.seeAll}>
                                See All
                            </Text>

                        </View>

                        <RulesGoalsComponent
                            data={eventDetail?.meeting_points}
                        />

                        {/* <View style={{ marginBottom: 20 }}>
                            <InterestList
                                interests={eventDetail?.categories}
                                onSelectionChange={handleSelectionChange}
                                test={true}
                            />
                        </View> */}

                        <View style={styles.aboutStyle}>


                            <Text style={{
                                color: theme.colors.white,
                                fontSize: scaleHeight(16),
                                fontFamily: fonts.fontsType.medium,

                            }}>
                                Routes
                            </Text>

                            <TouchableOpacity
                                onPress={navigateToEventRoutes}
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
                                Activities
                            </Text>

                            <TouchableOpacity
                                onPress={navigateToActivities}
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
                                Performance
                            </Text>

                            <TouchableOpacity
                                onPress={navigateToEventAchievement}
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


                            <Text style={styles.headingLabel}>
                                {`Participients (RSVP)`}
                            </Text>

                            {(role == 'ADMIN' || user_id == eventDetail?.host?.id) || (isEventJoined && eventDetail?.is_public) &&
                                <TouchableOpacity
                                    onPress={handleManageRSVP}
                                >
                                    <Text style={styles.seeAll}>
                                        Manange
                                    </Text>
                                </TouchableOpacity>
                            }

                        </View>

                        <View>
                            <FlatList
                                data={invitiesList?.slice(0, 5)}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <InvitiesUserList item={item} />}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>

                        <RulesGoalsComponent
                            data={eventDetail?.goals}
                            iconColor={theme.colors.textHeading}
                            iconName='radiobox-marked'
                        />

                        <ReviewList reviews={reviews} />

                    </View>



                    {user_id !== eventDetail?.host?.id && eventDetail?.is_public &&
                        <Button title={buttonTitle}
                            onPress={() => {
                                eventDetail?.is_paid ?
                                    openPaymentSheet(100, handleJoinEvent, 'Test User', user_id) :
                                    handleJoinEvent()

                            }}
                            customStyle={styles.customButton}
                        />}

                </ScrollView>
            }

            <ActionSheet
                ref={refRBSheet}
                sheetItems={sheetItems}
                sheetHight={160}
            />
            <CustomModal
                isVisible={modalVisible}
                onClose={handleCloseModal}
                headerTitle={"Delete Event?"}
                imageSource={warningImg}
                isParallelButton={true}
                text={`Do you really want to delete event?`}
                parallelButtonText1={"Cancel"}
                parallelButtonText2={"Yes, Delete"}
                parallelButtonPress1={() => {
                    handleCloseModal()
                }}
                parallelButtonPress2={() => {
                    handleCloseModal()
                    handleDeleteClub()
                }}
            />
        </SafeAreaView>
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
    tagStyle: {
        borderRadius: 10,
        padding: 8,

    },
    tagLabel: {
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(12),
        color: theme.colors.white
    },
    about: {
        color: theme.colors.labelColors,
        fontSize: scaleHeight(15),
        fontFamily: fonts.fontsType.light,
        marginBottom: scaleHeight(10),
        marginHorizontal: 10
    },
    headingLabel: {
        color: theme.colors.white,
        fontSize: scaleHeight(16),
        fontFamily: fonts.fontsType.medium,

    },
    seeAll: {
        color: theme.colors.textHeading,
        fontSize: scaleHeight(14),
        fontFamily: fonts.fontsType.bold,

    },
    customButton: { backgroundColor: theme.colors.textHeading, width: '80%' },
    contentContainer: { marginTop: scaleHeight(-10), marginHorizontal: 20 }
});

export default EventDetail;
