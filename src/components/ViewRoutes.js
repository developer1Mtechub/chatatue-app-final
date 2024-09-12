import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Swiper from 'react-native-swiper';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions'; // Import MapViewDirections
import { mapMarker } from '../assets/images';
import { GOOGLE_API_KEY } from '@env';

const FullScreenBottomSheet = ({ refRBSheet, routes, selectedRouteIndex, theme }) => {
    const [swiperIndex, setSwiperIndex] = useState(0);

    useEffect(() => {
        setSwiperIndex(selectedRouteIndex); // Update the swiper index when the parent changes the selected route
    }, [selectedRouteIndex]);

    return (
        <RBSheet
            ref={refRBSheet}
            //closeOnDragDown={true}
            closeOnPressMask={true}
            height={Dimensions.get('window').height}
            customStyles={{
                container: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                },
            }}
        >
            <View style={styles.contentContainer}>
                <Swiper
                    style={styles.wrapper}
                    //showsButtons={true}
                    dotStyle={styles.dot}
                    activeDotStyle={styles.activeDot}
                    index={swiperIndex} // Set the initial swiper slide based on the selected index
                >
                    {routes?.map((route, index) => (
                        <View style={styles.slide} key={`route-${index}`}>
                            {/* MapView for each route */}
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: route.startPoint?.latitude || 37.78825,
                                    longitude: route.startPoint?.longitude || -122.4324,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >
                                {/* Start Point Marker */}
                                {route.startPoint && <Marker tracksViewChanges={false} coordinate={route.startPoint} title={`Start\t\tElevation ${route.startPoint?.elevation}`} >
                                    <View>
                                        <Image style={styles.marker} source={mapMarker} />
                                    </View>
                                </Marker>}
                                {route.endPoint && <Marker tracksViewChanges={false} coordinate={route.endPoint} title={`End\t\tElevation ${route.endPoint?.elevation}`}>
                                    <View>
                                        <Image style={styles.marker} source={mapMarker} />
                                    </View>
                                </Marker>}

                                {/* Waypoints */}
                                {route.waypoints?.map((point, idx) => (
                                    <Marker
                                        key={`waypoint-${idx}`}
                                        coordinate={point}
                                        title={`Waypoint ${idx + 1}`}
                                    />
                                ))}

                                {/* Directions */}
                                {route.startPoint && route.endPoint && (
                                    <MapViewDirections
                                        origin={route.startPoint}
                                        destination={route.endPoint}
                                        waypoints={route.waypoints}
                                        apikey={GOOGLE_API_KEY} // Pass the Google API key here
                                        strokeWidth={3}
                                        strokeColor={theme.colors.secondary} // Customize stroke color
                                    />
                                )}
                            </MapView>

                            {/* Location Info */}
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationText}>
                                    Start: {route.startLocationName}
                                </Text>
                                <Text style={styles.locationText}>
                                    End: {route.endLocationName}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>
        </RBSheet>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
    wrapper: {},
    slide: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '80%',
    },
    locationInfo: {
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dot: {
        backgroundColor: 'rgba(0,0,0,.2)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    activeDot: {
        backgroundColor: '#007aff',
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
});

export default FullScreenBottomSheet;
