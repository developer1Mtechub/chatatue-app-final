import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import theme from '../../../styles/theme';
import Header from '../../../components/Header';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import useBackHandler from '../../../utils/useBackHandler';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import fonts from '../../../styles/fonts';
import Icon from 'react-native-vector-icons/AntDesign'
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getAchievement } from '../../../redux/EventSlices/getAchievementSlice';
import FullScreenLoader from '../../../components/FullScreenLoader';
import moment from 'moment';
import { getRouteById } from '../../../redux/ClubCreation/getRouteByIdSlice';
import Button from '../../../components/ButtonComponent';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const UserPerformance = ({ navigation }) => {
    const dispatch = useDispatch();
    const { achievementDetail, loading } = useSelector((state) => state.getAchievement)
    const { routeDetail } = useSelector((state) => state.getRouteById)
    const { pace, duration, calories_burnt, event, user } = achievementDetail || {}
    const { data } = useSelector((state) => state.general)
    const tagTitle = event?.details?.is_public ? 'Public' : 'Private'
    const viewShotRef = useRef();

    const handleBackPress = () => {
        if (data?.previousScreen === SCREENS.EVENT_PERFORMANCE) {
            resetNavigation(navigation, SCREENS.EVENT_PERFORMANCE);
        }
        else {
            resetNavigation(navigation, SCREENS.EVENT_DETAIL);
        }
        return true;
    };

    useBackHandler(handleBackPress);

    useFocusEffect(
        useCallback(() => {
            dispatch(getAchievement(data?.achievementId));
        }, [dispatch, data])
    );


    useFocusEffect(
        useCallback(() => {
            dispatch(getRouteById(event?.details?.route_ids[0]));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dispatch, achievementDetail])
    );


    const captureAndShareScreenshot = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            const imagePath = `${RNFS.CachesDirectoryPath}/screenshot.png`;
            await RNFS.moveFile(uri, imagePath);
            await Share.open({
                message: 'Checkout my performance',
                url: `file://${imagePath}`,
                type: 'image/png',
                failOnCancel: false, // Optional: Handle cancel actions
            });

        } catch (error) {
            alert('Error', 'An error occurred while capturing and sharing the screenshot.');
            console.error('Error capturing and sharing view:', error);
        }
    };

    const showLoader = () => {
        return <FullScreenLoader
            loading={loading} />;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={'Performance'}
                isBackIcon={true}
                onBackPress={handleBackPress}
            />
            {
                loading ? showLoader() :

                    <ViewShot style={{ flex: 1 }} ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
                        <ScrollView style={{ flex: 1 }}>

                            <View style={styles.imageContainer}>
                                <Image
                                    resizeMode='contain'
                                    source={{ uri: user?.profile_image?.url }}
                                    style={styles.avatar}
                                />
                                <View style={styles.ratingContainer}>
                                    <Text style={styles.name}>{user?.username}</Text>
                                </View>
                                <View style={[styles.ratingContainer, styles.marginTop10]}>
                                    <View style={[styles.tagStyle, styles.marginRight10]}>
                                        <Text style={styles.tagText}>Intermidiate</Text>
                                    </View>
                                    <View style={[styles.tagStyle, styles.eveningTag]}>
                                        <Text style={styles.tagText}>Evening</Text>
                                    </View>
                                </View>
                                <View style={[styles.ratingContainer, styles.centerContent]}>
                                    <View style={styles.flexCenter}>
                                        <View style={styles.circle}>
                                            <Text style={styles.circleInnerText}>{`${duration?.hours || '00'}:${duration?.minutes || '00'}:${duration?.seconds || '00'}`}</Text>
                                            <Text style={styles.durationText}>Duration</Text>
                                        </View>
                                        <Text style={styles.circleOuterText}>Total Duration</Text>
                                    </View>
                                    <View style={styles.flexCenter}>
                                        <View style={[styles.circle, styles.paceCircle]}>
                                            <Text style={styles.circleInnerText}>{pace}</Text>
                                            <Text style={styles.durationText}>Min/km</Text>
                                        </View>
                                        <Text style={styles.circleOuterText}>Pace</Text>
                                    </View>
                                    <View style={styles.flexCenter}>
                                        <View style={[styles.circle, styles.caloriesCircle]}>
                                            <Text style={styles.circleInnerText}>{calories_burnt}</Text>
                                            <Text style={styles.durationText}>Kcal</Text>
                                        </View>
                                        <Text style={styles.circleOuterText}>Calories Burnt</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.contentContainer}>
                                <Text style={styles.achievementTitle}>{'Elite Endurance'}</Text>
                                <View style={[styles.ratingContainer, styles.marginTop10]}>
                                    <View style={[styles.tagStyle, styles.clubTag]}>
                                        <Text style={styles.tagText}>{event?.details?.name}</Text>
                                    </View>
                                    <View style={[styles.tagStyle, styles.publicTag]}>
                                        <Text style={styles.tagText}>{tagTitle}</Text>
                                    </View>
                                </View>
                                <View style={styles.imageRow}>
                                    <Image
                                        style={styles.eventImage}
                                        resizeMode='contain'
                                        source={{ uri: event?.details?.images[0]?.url }}
                                    />
                                    <View style={styles.imageTextContainer}>
                                        <Text style={styles.eventTitle}>{event?.details?.name}</Text>
                                        <Text style={[styles.circleOuterText, { width: '60%' }]}>{`Start: ${routeDetail?.start_loc_name}`}</Text>
                                        <Text style={[styles.circleOuterText, { width: '60%' }]}>{`End: ${routeDetail?.end_loc_name}`}</Text>
                                        <View style={styles.eventDateContainer}>
                                            <Icon name='calendar' size={24} color={theme.colors.textHeading} />
                                            <Text style={styles.eventDate}>{moment(event?.details?.start_date).format('dddd, MMM D YYYY')}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.achievementText}>Achievement</Text>
                            </View>

                        </ScrollView>
                    </ViewShot>

            }

            <Button
                onPress={captureAndShareScreenshot}
                title={'Share'}
                customStyle={{
                    width: '70%',
                    marginBottom: 30
                }} />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    imageContainer: {
        alignItems: 'center',
        margin: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: theme.colors.textHeading,
    },
    name: {
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.bold,
        color: '#BEC5D1',
    },
    tagStyle: {
        borderRadius: 10,
        backgroundColor: "#FFC600",
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    tagText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(12),
        color: theme.colors.white,
    },
    circleOuterText: {
        fontFamily: fonts.fontsType.semiBold,
        fontSize: normalizeFontSize(12),
        color: theme.colors.labelColors,
        marginTop: 10,
    },
    circleInnerText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(11),
        color: theme.colors.black,
    },
    circle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        borderWidth: 6,
        borderColor: '#BA20AE',
    },
    durationText: {
        fontSize: normalizeFontSize(10),
        fontFamily: fonts.fontsType.light,
    },
    flexCenter: {
        flex: 1,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: scaleHeight(30),
    },
    achievementTitle: {
        color: theme.colors.white,
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.bold,
    },
    clubTag: {
        backgroundColor: theme.colors.secondary,
        marginRight: 10,
    },
    publicTag: {
        backgroundColor: theme.colors.success,
    },
    eventImage: {
        width: 140,
        height: 110,
        borderRadius: 20,
    },
    imageTextContainer: {
        marginHorizontal: 10,
    },
    eventTitle: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(14),
        color: theme.colors.white
    },
    eventDateContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    eventDate: {
        fontFamily: fonts.fontsType.regular,
        color: theme.colors.textHeading,
        alignSelf: 'center',
        marginHorizontal: 8,
    },
    eventText: {
        fontFamily: fonts.fontsType.regular,
        marginTop: 5,
    },
    achievementText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
        marginTop: scaleHeight(20),
    },
    marginTop10: {
        marginTop: 10,
    },
    marginRight10: {
        marginRight: 10,
    },
    centerContent: {
        marginTop: scaleHeight(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    eveningTag: {
        backgroundColor: "#EB7218",
    },
    paceCircle: {
        borderColor: '#FA0000',
    },
    caloriesCircle: {
        borderColor: '#00C14A',
    },
    imageRow: {
        flexDirection: 'row',
        marginTop: scaleHeight(20),
    },
});

export default UserPerformance;
