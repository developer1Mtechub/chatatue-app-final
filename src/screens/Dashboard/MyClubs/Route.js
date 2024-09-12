import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
import { useDispatch, useSelector } from 'react-redux';
import { setTrackingRoute } from '../../../redux/setEventRoutesSlice';
import { getAllRoutes } from '../../../redux/ClubCreation/getAllRoutesSlice';

const { width } = Dimensions.get('window');

const Routes = ({ navigation }) => {
    const dispatch = useDispatch();
    const { eventRoutes } = useSelector((state) => state.eventRoutes)
    const { data } = useSelector((state) => state.general)
    const [activeSlide, setActiveSlide] = useState(0);
    const mapRef = useRef(null);
    const currentRoute = eventRoutes[activeSlide];
    const isClubRoute = data?.previousScreen === SCREENS.CLUB_DETAIL ? true : false
    const headingTitle = isClubRoute ? "Club Routes" : "Event Routes"

    const handleBackPress = () => {
        if (isClubRoute) {
            resetNavigation(navigation, SCREENS.CLUB_DETAIL)
        } else {
            resetNavigation(navigation, SCREENS.EVENT_DETAIL)
        }

        return true;
    }

    useBackHandler(handleBackPress)

    const navigateToTrackingRoute = () => {
        const finalRoute = { ...currentRoute, event_id: data?.eventId }
        dispatch(setTrackingRoute([finalRoute]))
        resetNavigation(navigation, SCREENS.TRACKING_ROUTE)
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


    const onSnapToItem = (index) => {
        setActiveSlide(index);
        const selectedRoute = eventRoutes[index];
        const { start_lat, start_long, end_lat, end_long } = selectedRoute;

        mapRef.current?.fitToCoordinates(
            [
                { latitude: parseFloat(start_lat), longitude: parseFloat(start_long) },
                { latitude: parseFloat(end_lat), longitude: parseFloat(end_long) }
            ],
            { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
        );
    };

    useEffect(() => {
        const selectedRoute = eventRoutes[0];
        const { start_lat, start_long, end_lat, end_long } = selectedRoute;

        mapRef.current?.fitToCoordinates(
            [
                { latitude: parseFloat(start_lat), longitude: parseFloat(start_long) },
                { latitude: parseFloat(end_lat), longitude: parseFloat(end_long) }
            ],
            { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const RouteInfoCard = ({ schedule, index }) => {
        const isActive = index === activeSlide;
        return (

            <View style={[styles.card, isActive && { borderWidth: 2, borderColor: theme.colors.textHeading }]}>
                <Text style={[styles.labelStyle]}>Start:
                    <Text style={styles.locationStyle}>{`  ${schedule.start_loc_name}`}</Text>
                </Text>

                <View style={{ marginTop: 10 }}>
                    <Text style={styles.labelStyle}>End:
                        <Text style={styles.locationStyle}>{`  ${schedule.end_loc_name}`}
                        </Text>
                    </Text>
                </View>
            </View>
        )
    };



    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={headingTitle}
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

            <View>
                <Carousel
                    data={eventRoutes}
                    renderItem={({ item, index }) => <RouteInfoCard schedule={item} index={index} />}
                    sliderWidth={width}
                    itemWidth={width * 0.8}
                    layout={'default'}
                    activeSlideAlignment={'center'}
                    inactiveSlideScale={0.9}
                    inactiveSlideOpacity={0.7}
                    loop={false}
                    pagingEnabled
                    onSnapToItem={onSnapToItem}
                />
                <Pagination
                    dotsLength={eventRoutes.length}
                    activeDotIndex={activeSlide}
                    containerStyle={styles.paginationContainer}
                    dotStyle={styles.dot}
                    inactiveDotStyle={styles.inactiveDot}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                />
            </View>
            {!isClubRoute && <Button
                onPress={navigateToTrackingRoute}
                title={'Start Run'}
                customStyle={{
                    marginBottom: 0,
                    marginTop: 10,
                    width: '82%'
                }} />}
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
        height: '55%',
        marginHorizontal: 30
    },
    map: {
        ...StyleSheet.absoluteFillObject,

    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginTop: scaleHeight(40)
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
        color: theme.colors.primary,
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
});

export default Routes;
