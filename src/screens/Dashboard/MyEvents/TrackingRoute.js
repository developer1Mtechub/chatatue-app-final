import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import theme from '../../../styles/theme';
import { GOOGLE_API_KEY } from '@env'
import { mapMarker } from '../../../assets/images';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import { WaypointIcon } from '../../../assets/svgs';
import Button from '../../../components/ButtonComponent';
import Header from '../../../components/Header';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import useBackHandler from '../../../utils/useBackHandler';
import fonts from '../../../styles/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch, useSelector } from 'react-redux';
import { createDeleteAchievements } from '../../../redux/EventSlices/createDeleteAchievementsSlice';
import { useAlert } from '../../../providers/AlertContext';
import { createDelayedNavigation } from '../../../utils/navigationWithDelay';
import { setData } from '../../../redux/generalSlice';
import { requestLocationPermission } from '../../../utils/cameraPermission';
import Geolocation from '@react-native-community/geolocation';
import Fitness from '@ovalmoney/react-native-fitness';
import CustomTextInput from '../../../components/TextInputComponent';
import CustomStarIcon from '../../../components/CustomStarIcon';
import ToggleSwitch from 'toggle-switch-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import StarRating from 'react-native-star-rating-widget';
import { addReview } from '../../../redux/ReviewSlices/AddReviewSlice';


const { width } = Dimensions.get('window');

const TrackingRoute = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.createDeleteAchievements)
    const { loading: reviewLoader } = useSelector((state) => state.addReview)
    const { showAlert } = useAlert();
    const { user_id } = useSelector((state) => state.auth)
    const { data } = useSelector((state) => state.general)
    const { trackingRoute } = useSelector((state) => state.eventRoutes)
    const [activeSlide, setActiveSlide] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const mapRef = useRef(null);
    const currentRoute = trackingRoute[activeSlide];
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const timerRef = useRef(null);
    const refRBSheet = useRef();
    const [watchId, setWatchId] = useState(null);
    const [burntCaleroies, setCalories] = useState(0);
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const { start_lat, start_long, end_lat, end_long, start_loc_name, end_loc_name } = currentRoute;
    const [coordinate, setCoordinate] = useState(new AnimatedRegion({
        latitude: 33.669409,
        longitude: 72.997193,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }));

    const navigateToAchivement = createDelayedNavigation(navigation, SCREENS.USER_PERFORMANCE)
    const today = new Date().toISOString().split('T')[0];
    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.EVENT_DETAIL)
        return true;
    }

    useBackHandler(handleBackPress)

    const permissions = [
        { kind: Fitness.PermissionKinds.Steps, access: Fitness.PermissionAccesses.Read },
        { kind: Fitness.PermissionKinds.Calories, access: Fitness.PermissionAccesses.Read },
        { kind: Fitness.PermissionKinds.Distances, access: Fitness.PermissionAccesses.Read },
    ];

    function getTodaysCalories(calories) {
        const todayCalories = calories?.find(entry => entry?.startDate.split('T')[0] === today);
        return todayCalories ? todayCalories?.quantity : 0;
    }

    function fetchTodaysCalories() {
        const now = new Date();
        const startDate = new Date(now.setUTCHours(0, 0, 0, 0)).toISOString();
        const endDate = new Date().toISOString();
        Fitness.getCalories({
            startDate: startDate,
            endDate: endDate,
            interval: 'day',
        })
            .then(calories => {
                const finalCalories = getTodaysCalories(calories)
                setCalories(finalCalories)
                console.log('Calories for today:', calories);
            })
            .catch(error => {
                console.error('Error fetching calories:', error);
            });
    }

    useEffect(() => {

        startTimer();

        Fitness.isAuthorized(permissions)
            .then((authorized) => {
                console.log('authorized', authorized)
                // Do something
            })
            .catch((error) => {
                console.log('error', error)
                // Do something
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    useEffect(() => {
        requestLocationPermission()
        const fetchCurrentLocation = async () => {
            try {
                const getPosition = () => new Promise((resolve, reject) => {
                    Geolocation.getCurrentPosition(resolve, reject);
                });

                const { coords: { latitude, longitude } } = await getPosition();

                const location = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };

                setUserLocation(location);
                coordinate.setValue(location);
                mapRef.current?.animateToRegion(location, 1000);
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchCurrentLocation();
        const watchCurrentLocation = async () => {
            try {
                const id = Geolocation.watchPosition(
                    ({ coords: { latitude, longitude } }) => {

                        const newLocation = {
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        };

                        // Smooth marker movement
                        coordinate.timing(newLocation, { duration: 1000 }).start();
                        setUserLocation((prevLocation) => ({
                            ...prevLocation,
                            latitude: prevLocation ? latitude : latitude,
                            longitude: prevLocation ? longitude : longitude,
                        }));
                        mapRef.current?.animateToRegion(newLocation, 1000);
                        // const location = {
                        //     latitude,
                        //     longitude,
                        //     latitudeDelta: 0.0922,
                        //     longitudeDelta: 0.0421,
                        // };

                        // setUserLocation(location);

                        // mapRef.current.animateToRegion(location, 1000);
                    },
                    (error) => {
                        console.log("Error watching position:", error.message);
                    },
                    {
                        enableHighAccuracy: true,
                        distanceFilter: 10,
                        interval: 5000,
                    }
                );

                setWatchId(id); // Store the watchId to clear it later
            } catch (error) {
                console.log("Error setting up watch position:", error.message);
            }
        };

        watchCurrentLocation();

        return () => Geolocation.clearWatch(watchId); // Cleanup on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coordinate]);

    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Start the timer
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
    };

    // Stop the timer
    const stopTimer = () => {
        if (isRunning) {
            clearInterval(timerRef.current);
            setIsRunning(false);
        }
    };

    const stopTracking = () => {
        if (watchId !== null) {
            Geolocation.clearWatch(watchId); // Clear the watch to stop tracking
            setWatchId(null); // Reset the watchId
        }
    };

    const createAchievement = () => {
        fetchTodaysCalories();
        stopTimer();
        stopTracking();
        const dataPayload = {
            user_id: user_id,
            event_id: currentRoute?.event_id,
            pace: 50,
            duration: formatTime(time),
            calories_burnt: parseInt(burntCaleroies)?.toFixed(1)
        }

        const finalPayload = {
            data: dataPayload,
            method: 'POST'
        }

        dispatch(createDeleteAchievements(finalPayload)).then((result) => {
            const { success, message } = result?.payload
            if (success) {
                showAlert("Success", "success", message)
                dispatch(setData({
                    achievementId: result?.payload?.result?.id
                }))
                navigateToAchivement();
            } else if (!success) {
                showAlert("Error", "error", message)
            }
        })

    }


    const startPoint = currentRoute ? {
        latitude: parseFloat(currentRoute.start_lat),
        longitude: parseFloat(currentRoute.start_long),
        elevation: currentRoute.start_elevation
    } : null;

    const endPoint = currentRoute ? {
        latitude: parseFloat(currentRoute.end_lat),
        longitude: parseFloat(currentRoute.end_long),
        elevation: currentRoute.end_elevation
    } : null;

    const waypoints = currentRoute ? currentRoute?.waypoints?.map(point => ({
        latitude: parseFloat(point.lat),
        longitude: parseFloat(point.long),
        elevation: point.elevation
    })) : [];


    useEffect(() => {

        mapRef.current?.fitToCoordinates(
            [
                { latitude: parseFloat(start_lat), longitude: parseFloat(start_long) },
                { latitude: parseFloat(end_lat), longitude: parseFloat(end_long) }
            ],
            { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const RouteInfoCard = () => {
        return (

            <View style={[styles.card,]}>
                <Text style={[styles.labelStyle]}>Start:
                    <Text style={styles.locationStyle}>{`  ${start_loc_name}`}</Text>
                </Text>

                <View style={{ marginTop: 10 }}>
                    <Text style={styles.labelStyle}>End:
                        <Text style={styles.locationStyle}>{`  ${end_loc_name}`}
                        </Text>
                    </Text>
                </View>
            </View>
        )
    };


    const handleSheetClose = () => {
        refRBSheet.current.close();
    };

    const handleSheetOpen = () => {
        refRBSheet.current.open();
    };

    const handleAddReview = () => {
        if (rating === 0) {
            showAlert("Error", "error", "Add rating to give review.")
            return
        }
        const payload = {
            reviewer_id: user_id,
            event_id: data?.eventId,
            type: "EVENT",
            rating: rating,
            comment: comment,
            is_anonymus: isEnabled
        }
        dispatch(addReview(payload)).then((result) => {
            const { success, message } = result?.payload
            if (success) {
                handleSheetClose();
                setRating(0)
                setComment('')
                showAlert("Success", "success", message)

            } else {
                showAlert("Error", "error", message)
                handleSheetClose();
            }
        })
    }

    const renderReviewSheet = () => {
        return <RBSheet
            ref={refRBSheet}
            openDuration={800}
            customStyles={{
                wrapper: styles.wrapper,
                container: [styles.sheetContainer,
                { backgroundColor: theme.colors.primary, height: keyboardStatus ? '80%' : '50%' }]
            }}
            closeOnPressBack={true}
        >

            <View style={{ padding: 20, flex: 1 }}>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                    <Text style={{
                        fontFamily: fonts.fontsType.bold,
                        fontSize: normalizeFontSize(16),
                        color: theme.colors.white,
                        alignSelf: 'center'
                    }}>
                        Rate a Event
                    </Text>

                    {/* <TouchableOpacity onPress={handleSheetClose}>
                        <CloseIcon width={24} height={24} />
                    </TouchableOpacity> */}


                </View>

                <View style={styles.starContainer}>
                    <StarRating
                        rating={rating}
                        onChange={setRating}
                        maxStars={5}
                        color={theme.colors.textHeading}
                        starSize={30}
                        StarIconComponent={(props) => <CustomStarIcon {...props} />}
                        style={{
                            marginTop: 15,
                            alignSelf: 'center'
                        }}
                    />
                </View>

                <CustomTextInput
                    identifier={'rate'}
                    value={comment}
                    onValueChange={setComment}
                    multiline={true}
                    label={"Write Review"}
                />

                <View style={styles.toggleContainer}>

                    <ToggleSwitch
                        isOn={isEnabled}
                        onColor={'rgba(252, 226, 32, 0.15)'}
                        offColor={'rgba(217, 217, 217, 1)'}
                        onValueChange={toggleSwitch}
                        thumbOnStyle={{ backgroundColor: theme.colors.textHeading }}
                        thumbOffStyle={{ backgroundColor: 'rgba(137, 137, 137, 1)' }}
                        size="medium"
                        onToggle={(isOn) => toggleSwitch(isOn)}
                    />
                    <Text style={styles.settingText}>{"Mark Anonymous"}</Text>
                </View>

                <Button
                    loading={reviewLoader}
                    onPress={handleAddReview}
                    title={"Rate & Review"}
                    customStyle={{
                        width: '80%',
                        marginBottom: 10,
                        marginTop: 30
                    }}
                />
            </View>

        </RBSheet>
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={'Event Route'}
                isBackIcon={true}
                onBackPress={handleBackPress}
            />
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: startPoint?.latitude || 33.669409,
                        longitude: startPoint?.longitude || 72.997193,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {/* Start marker */}
                    {startPoint && (
                        <Marker tracksViewChanges={false} coordinate={startPoint} title={`Start\t\tElevation ${startPoint?.elevation}`} >
                            <Image style={styles.marker} source={mapMarker} />
                        </Marker>
                    )}

                    {/* End marker */}
                    {endPoint && (
                        <Marker tracksViewChanges={false} coordinate={endPoint} title={`Start\t\tElevation ${endPoint?.elevation}`} >
                            <Image style={styles.marker} source={mapMarker} />
                        </Marker>
                    )}

                    {/* Waypoints markers */}
                    {waypoints?.map((point, index) => (
                        <Marker
                            tracksViewChanges={false}
                            key={`waypoint-${index}`}
                            coordinate={point}
                            title={`Waypoint ${index + 1}\t\t${point?.elevation}`} >
                            <WaypointIcon />
                        </Marker>
                    ))}

                    {/* User location marker */}
                    {userLocation && (
                        <Marker.Animated
                            tracksViewChanges={false}
                            coordinate={coordinate}>
                            <View style={styles.userMarker}>
                                <Image style={styles.markerImage} source={mapMarker} />
                            </View>
                        </Marker.Animated>
                    )}

                    {/* Directions */}
                    {startPoint && endPoint && (
                        <MapViewDirections
                            origin={startPoint}
                            destination={endPoint}
                            waypoints={waypoints}
                            apikey={GOOGLE_API_KEY}
                            strokeWidth={3}
                            strokeColor={theme.colors.secondary}
                        />
                    )}
                </MapView>
            </View>

            <View style={{
                flexDirection: 'row',
                marginHorizontal: scaleWidth(18),
                top: scaleHeight(15)
            }}>
                <Icon size={28} name='timer-outline' color={theme.colors.textHeading} />
                <Text style={[styles.locationStyle, { alignSelf: 'center', marginHorizontal: 8, fontSize: normalizeFontSize(14) }]}>{`${formatTime(time)}`}
                </Text>
            </View>

            <RouteInfoCard />

            <Button
                loading={loading}
                onPress={() => {
                    createAchievement()
                }}
                title={'Stop Run'}
                customStyle={{
                    marginBottom: 0,
                    marginTop: 10,
                    width: '82%'
                }} />
            {renderReviewSheet()}
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    mapContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: '5%',
        height: '60%',
        marginHorizontal: 30
    },
    map: {
        ...StyleSheet.absoluteFillObject,

    },
    card: {
        borderRadius: 8,
        padding: 16,
        margin: 8,
        marginTop: scaleHeight(10)
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    labelStyle: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.textHeading,
    },
    locationStyle: {
        fontSize: normalizeFontSize(12),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.white,
    },
    paginationContainer: {
        paddingVertical: 8,
        position: 'absolute',
        bottom: scaleHeight(135),
        alignSelf: 'center'
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 10,
        backgroundColor: theme.colors.textHeading,
    },
    inactiveDot: {
        width: 12,
        height: 12,
        borderRadius: 10,
        backgroundColor: '#bbb',
    },
    marker: {
        width: scaleWidth(40),
        height: scaleHeight(40)
    },
    userMarker: {
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerImage: {
        height: 40,
        width: 40,
    },

    starContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    wrapper: {
        backgroundColor: 'rgba(128, 128, 128, 0.20)',
    },
    sheetContainer: {
        borderTopEndRadius: 30,
        borderTopStartRadius: 30,
        width: '100%',
        alignSelf: 'center',
    },
    toggleContainer: { flexDirection: 'row', top: 15, marginStart: 10 },
    settingText: {
        fontSize: scaleHeight(14),
        fontFamily: fonts.fontsType.semiBold,
        marginRight: 10,
        flex: 1,
        color: theme.colors.white,
        marginLeft: 15
    },
});

export default TrackingRoute;
