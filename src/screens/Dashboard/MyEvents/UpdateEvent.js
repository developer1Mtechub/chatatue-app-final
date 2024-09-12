import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Keyboard, ToastAndroid, Dimensions, Animated, ScrollView, FlatList } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons'
import AddIcon from 'react-native-vector-icons/AntDesign'
import Cross from 'react-native-vector-icons/Entypo'
import RBSheet from 'react-native-raw-bottom-sheet';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_API_KEY } from '@env'
import { useAlert } from '../../../providers/AlertContext';
import { resetNavigation } from '../../../utils/resetNavigation';
import { SCREENS } from '../../../constant/constants';
import useBackHandler from '../../../utils/useBackHandler';
import { getCategories } from '../../../redux/AuthSlices/getCategoriesSlices';
import { getElevation } from '../../../utils/elevationService';
import { createEvent } from '../../../redux/EventSlices/createEventSlice';
import { createClubRoute } from '../../../redux/ClubCreation/createClubRouteSlice';
import { createClubRules } from '../../../redux/ClubCreation/createClubRulesSlice';
import { createClubGoal } from '../../../redux/ClubCreation/createClubGoalSlice';
import { createSchedule } from '../../../redux/ClubCreation/createScheduleSlice';
import { uploadImage } from '../../../redux/cloudinarySlice';
import CustomTextInput from '../../../components/TextInputComponent';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../styles/responsive';
import theme from '../../../styles/theme';
import Button from '../../../components/ButtonComponent';
import GoalsItem from '../../../components/GoalsItem';
import CustomLayout from '../../../components/CustomLayout';
import AddRouteItem from '../../../components/AddedRouteItem';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { addGoalsImg, mapMarker } from '../../../assets/images';
import { BackButton, CloseIcon, WaypointIcon } from '../../../assets/svgs';
import InterestList from '../../../components/InterestList';
import fonts from '../../../styles/fonts';
import DynamicDatePicker from '../../../components/DynamicDatePicker';
import CustomToggleSwitch from '../../../components/CustomToggleSwitch';
import CustomDropdown from '../../../components/CustomDropdown';
import { API_BASE_URL } from '@env'
import { getRoutesByClub } from '../../../redux/EventSlices/getRoutesByClubSlice';
import { createClub } from '../../../redux/ClubCreation/createClubSlice';
import { createDeleteMeetingPoints } from '../../../redux/EventSlices/createDeleteMeetingPointsSlice';
import { sendInvitation } from '../../../redux/EventSlices/sendInvitationSlice';
import ListBottomSheet from '../../../components/ListBottomSheet';
import { resetData } from '../../../redux/generalSlice';
import { addEventActivity } from '../../../redux/EventSlices/addEventActivitySlice';
import { getEventDetail } from '../../../redux/EventSlices/getEventDetailSlice';
import ItemWithEditAction from '../../../components/ItemWithEditAction';
import Header from '../../../components/Header';
import CustomSheet from '../../../components/CustomSheet';
import ClubMembersItem from '../../../components/ClubMembersItem';
import { getAllClubs } from '../../../redux/ClubCreation/getAllClubsSlice';
import { getClubMembers } from '../../../redux/ManageClub/getClubMembersSlice';



const { width, height } = Dimensions.get('window');

const UpdateEvent = ({ navigation }) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { categories } = useSelector((state) => state.categories)
    const { loading } = useSelector((state) => state.createEvent)
    const { loading: routeLoader } = useSelector((state) => state.createClubRoute)
    const { loading: invitationLoader } = useSelector((state) => state.sendInvitation)
    const { loading: activityLoader } = useSelector((state) => state.addEventActivity)
    const { loading: duplicateEventLoader } = useSelector((state) => state.getEventDetail)
    const { clubMembers } = useSelector((state) => state.getClubMembers)
    const { clubs, role } = useSelector((state) => state.getAllClubs);
    const { user_id } = useSelector((state) => state.auth)
    const { data } = useSelector((state) => state.general)
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [eventLocation, setEventLocation] = useState(null);
    const [wayPoints, setWayPoints] = useState([]);
    const [waypoints, setWaypoints] = useState(['']);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState('');
    const [activityName, setActivityName] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [activityLocation, setActivityLocation] = useState(null);
    const [eventFee, setEventFee] = useState(0);
    const [distance, setDistance] = useState(0);
    const [mediaImages, setMediaImages] = useState([]);
    const [type, setType] = useState('rules');
    const [currentStep, setCurrentStep] = useState(0);
    const [sheetView, setSheetView] = useState(0);
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const [meetingPoints, setMeetingPoints] = useState([]);
    const [clubRules, setClubRules] = useState([]);
    const [addedRoutes, setAddedRoutes] = useState([]);
    const [memberList, setMemberList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [memberEmail, setMemberEmail] = useState('');
    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isPrivateEvent, setEventPrivate] = useState(false)
    const [isPaidEvent, setPaidEvent] = useState(false)
    const [focusedInput, setFocusedInput] = useState(null);
    const [selectedClubId, setSelectedClubId] = useState(null);
    const [invitationData, setInvitationData] = useState(null);
    const [activityList, setActivityList] = useState([])
    const [eventCategories, setEventCategories] = useState([])
    const [emails, setEmails] = useState([{ id: 1, email: '' }]);
    const [emailsList, setEmailList] = useState([]);
    const uniqueClubMembers = Array.from(
        new Map(clubMembers?.map(member => [member.id, member])).values()
    );

    const startTimeSheetRef = useRef();
    const startDateSheetRef = useRef();
    const endTimeSheetRef = useRef();
    const endDateSheetRef = useRef();

    const scheduleSheetRef = useRef();
    const routeSheetRef = useRef();
    const activitySheetRef = useRef();
    const locationSheetRef = useRef();
    const membersSheet = useRef();

    const [errors, setErrors] = useState({
        name: '',
        description: '',
        startTime: '',
        startDate: '',
        endDate: '',
        eventFee: '',
        distance: '',
        eventType: ''
    });

    const [activityErrors, setActivityErrors] = useState({
        activityName: '',
        activityDescription: ''
    });

    const [selectedView, setSelectedView] = useState(null);
    const items = [
        { id: '0', label: 'Event Detail' },
        { id: '1', label: 'Location' },
        { id: '2', label: 'Routes' },
        { id: '3', label: 'Intresets' },
        { id: '4', label: 'Meeting Points' },
        { id: '5', label: 'Activity' },
        { id: '6', label: 'Send Invitation' },
    ];

    const [text, setText] = useState('');
    const [rules, setRules] = useState('');
    const [clubId, setClubId] = useState(null);
    const [eventId, setEventId] = useState(null);
    const refRBSheet = useRef();
    const mapRef = useRef(null);
    const ref = useRef();
    const buttonTitle = currentStep == 3 ? "Create Event" : "Continue"
    const sheetTitle = type === 'rules' ? "Add Rules" : "Add Meeting Points"
    const [loadingImages, setLoadingImages] = useState({});
    const finalCategory = data?.type === 'event_update' ? eventCategories : categories?.category

    const togglePrivateSwitch = () => setEventPrivate(previousState => !previousState);
    const togglePaidSwitch = () => setPaidEvent(previousState => !previousState);

    const handleImageLoadStart = (index) => {
        setLoadingImages(prevState => ({ ...prevState, [index]: true }));
    };

    const handleImageLoadEnd = (index) => {
        setLoadingImages(prevState => ({ ...prevState, [index]: false }));
    };

    const handleBackPress = () => {

        if (selectedView != null) {
            setSelectedView(null)
        } else {
            resetNavigation(navigation, SCREENS.EVENT_DETAIL)
            return true;
        }
    }

    useBackHandler(handleBackPress)


    useEffect(() => {
        if (data?.type === 'event_update') {
            setEventId(data?.eventId)
            dispatch(getEventDetail(data?.eventId)).then((result) => {
                if (result?.payload?.success) {
                    const { result: eventData } = result?.payload
                    const modifiedImages = eventData?.images?.map(image => ({
                        secure_url: image.url,
                        public_id: image.public_id
                    }));
                    setMediaImages(modifiedImages || [])
                    setDescription(eventData?.description)
                    setName(eventData?.name)
                    setEventType(eventData?.event_type)
                    setAddedRoutes(eventData?.routes || []);
                    setSelectedRoute(eventData?.routes || [])
                    setActivityList(eventData?.activities)
                    setEventPrivate(eventData?.is_public ? false : true)
                    setPaidEvent(eventData?.is_paid)
                    setEventFee(eventData?.amount)
                    setDistance(eventData?.distance)
                    const location = { latitude: eventData?.latitude, longitude: eventData?.longitude, location_name: eventData?.location }
                    setEventLocation(location)
                    setEventCategories(eventData?.categories)
                    setMeetingPoints(eventData?.meeting_points || [])
                    setStartTime(new Date(eventData?.start_time))
                    setStartDate(new Date(eventData?.start_date))
                    setEndDate(new Date(eventData?.end_date))


                }
            })
        }


    }, [dispatch, data])

    const handleSelectionChange = (selectedCategories) => {
        setSelectedCategories(selectedCategories);
    };

    const createClubValues = () => {
        return {
            name: name,
            description: description,
            eventFee: eventFee,
        };
    };

    const [selectedRoutes, setSelectedRoute] = useState([]);

    const handleRouteSelection = (item, isSelected) => {
        if (isSelected) {
            setSelectedRoute(prevSelected => [...prevSelected, item]);
        } else {
            setSelectedRoute(prevSelected =>
                prevSelected.filter(selectedItem => selectedItem !== item)
            );
        }
    };

    useEffect(() => {
        if (data?.type !== 'event_update') {
            if (data?.clubId || selectedClubId) {
                dispatch(getRoutesByClub({ searchPayload: { clubId: data?.clubId ? data?.clubId : selectedClubId } }))
                    .then((result) => {
                        if (result?.payload?.result) {
                            const { routes } = result.payload.result;
                            setAddedRoutes(routes || []);
                        } else {
                            console.log("Unexpected response structure:", result?.payload);
                            setAddedRoutes([]);
                        }
                    })
                    .catch((error) => {
                        console.log("Failed to fetch routes:", error);
                        setAddedRoutes([]);
                    });
            }
        }

    }, [dispatch, selectedClubId, data]);


    useEffect(() => {

        if (!startPoint && !endPoint) {
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

                    setCurrentLocation(location);
                    const newRegion = { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
                    mapRef.current.animateToRegion(newRegion, 1000);

                } catch (error) {
                    console.log(error.message);
                }
            };

            fetchCurrentLocation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchAllAPIsData = async () => {
            try {
                await Promise.all([
                    dispatch(getCategories({ isCategory: true })),
                    dispatch(getClubMembers({ clubId: data?.clubId ? data?.clubId : selectedClubId }))
                ]);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchAllAPIsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardStatus(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardStatus(false);
            }
        );
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const onPlaceSelected = async (details, flag, index = null) => {
        const location = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
        };

        const elev = await getElevation(location.latitude, location.longitude);
        const newRegion = { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
        mapRef.current.animateToRegion(newRegion, 1000);

        if (flag === 'start') {
            //setStartPoint(location);
            setStartPoint({ ...location, elevation: elev, location_name: details?.formatted_address });
        } else if (flag === 'end') {
            //setEndPoint(location);
            setEndPoint({ ...location, elevation: elev, location_name: details?.formatted_address });
        } else if (flag === 'event_location') {
            setEventLocation({ ...location, location_name: details?.formatted_address })
        }
        else if (flag === 'activity_location') {
            setActivityLocation({ ...location, location_name: details?.formatted_address })
        }

        else {
            // Update a specific waypoint if index is provided
            if (index !== null) {
                const updatedWaypoints = [...waypoints];
                updatedWaypoints[index] = { ...location, elevation: elev, location_name: details?.formatted_address };
                setWaypoints(updatedWaypoints);
            } else {
                // Add a new waypoint
                setWaypoints((prevWaypoints) => [
                    ...prevWaypoints,
                    { ...location, elevation: elev, location_name: details?.formatted_address },
                ]);
            }
        }



        // else {
        //     // setWayPoints((prevWayPoints) => [...prevWayPoints, location]);
        //     setWayPoints((prevWayPoints) => [
        //         ...prevWayPoints,
        //         { ...location, elevation: elev },
        //     ]);
        // }
    };

    const handleRemoveWaypoint = (index) => {
        setWaypoints(waypoints.filter((_, i) => i !== index)); // Remove the waypoint at the specified index
    };

    const handleAddWaypoint = () => {
        setWaypoints([...waypoints, '']); // Add a placeholder for the new waypoint
    };


    const handleEventCreate = () => {

        if (mediaImages?.length === 0) {
            showAlert("Error", "error", "Select at least 1 club photo.")
            return
        }

        const { name, description, eventFee } = createClubValues();
        const amount = parseInt(eventFee);
        let routeIds = [];

        const mediaImagesData = mediaImages?.map((image) => ({
            url: image?.secure_url,
            public_id: image?.public_id
        })) || [];

        selectedRoutes?.map((route) => {
            routeIds.push(route?.id)
        })

        const clubId = data?.clubId ? data?.clubId : selectedClubId
        const formatedStartDate = moment(startDate).format('YYYY-MM-DD')
        const formatedEndDate = moment(endDate).format('YYYY-MM-DD')

        const dataPayload = {
            club_id: clubId,
            userId: user_id,
            name: name,
            description: description,
            event_type: eventType,
            is_public: isPrivateEvent ? false : true,
            is_paid: isPaidEvent,
            amount: amount,
            start_time: startTime,
            start_date: formatedStartDate,
            end_date: formatedEndDate,
            distance: distance,
            route_ids: routeIds,
            category_ids: selectedCategories,
            location: eventLocation?.location_name,
            latitude: eventLocation?.latitude,
            longitude: eventLocation?.longitude,
            badge_ids: ["258bd903-a1f2-49cb-9532-ce7e48d39447"],
            images: mediaImagesData
        };

        const payload = {
            method: "PUT",
            data: dataPayload,
            eventId: eventId
        }

        dispatch(createEvent(payload)).then((result) => {
            if (result?.payload?.success === true) {
                // setEventId(result?.payload?.result?.id)
                showAlert("Success", "success", result?.payload?.message)
                const timer = setTimeout(() => {
                    setSelectedView(null)
                }, 3000);
                return () => clearTimeout(timer);

            } else if (result?.payload?.success === false) {
                showAlert("Error", "error", result?.payload?.message)
            }
        })

    }

    const handleCreateClubRoute = () => {
        const routeClubId = data?.clubId ? data?.clubId : selectedClubId
        // const modifiedWayPoints = wayPoints?.map(item => ({
        const modifiedWayPoints = waypoints?.map(item => ({
            lat: item.latitude,
            long: item.longitude,
            elevation: item.elevation
        }));


        const routePayload = {
            user_id: user_id,
            club_id: routeClubId,
            start_loc_name: startPoint?.location_name,
            end_loc_name: endPoint?.location_name,
            start_lat: startPoint?.latitude,
            start_long: startPoint?.longitude,
            start_elevation: startPoint?.elevation,
            end_lat: endPoint?.latitude,
            end_long: endPoint?.longitude,
            end_elevation: endPoint.elevation,
            waypoints: modifiedWayPoints
        }

        dispatch(createClubRoute(routePayload)).then((result) => {
            if (result?.payload?.success === true) {
                const routeData = result?.payload?.result
                setAddedRoutes(prevArray => [...prevArray, routeData]);
                setSelectedRoute(prevArray => [...prevArray, routeData])
                resetRoute();
                const timer = setTimeout(() => {
                    showAlert("Success", "success", result?.payload?.message)
                }, 500);
                return () => clearTimeout(timer);

            } else if (result?.payload?.success === false) {
                showAlert("Error", "error", result?.payload?.message)
            }
        })

    }

    const addGoal = () => {
        if (type === 'rules') {
            if (rules.trim()) {
                setClubRules([...clubRules, rules]);
                const payload = {
                    club_id: clubId,
                    rule: rules
                }
                dispatch(createClubRules(payload)).then((result) => {
                    if (result?.payload.success === true) {
                        showAlert("Success", "success", result?.payload?.message)
                    } else if (result?.payload.success === false) {
                        showAlert("Error", "error", result?.payload?.message)
                    }
                })
                setRules('');
                handleSheetClose()

            }
        } else {
            if (text.trim()) {
                const dataPayload = {
                    event_id: eventId,
                    description: text
                }
                const payload = {
                    data: dataPayload,
                    method: "POST"
                }
                dispatch(createDeleteMeetingPoints(payload)).then((result) => {
                    if (result?.payload.success === true) {
                        const { result: points } = result?.payload
                        setMeetingPoints([...meetingPoints, points]);
                        showAlert("Success", "success", result?.payload?.message)
                    } else if (result?.payload.success === false) {
                        showAlert("Error", "error", result?.payload?.message)
                    }
                })
                setText('');
                handleSheetClose()

            }
        }

    };

    const addMore = () => {

        if (type === 'rules') {
            if (rules.trim()) {
                setClubRules([...clubRules, rules]);
                const payload = {
                    club_id: clubId,
                    rule: rules
                }
                dispatch(createClubRules(payload)).then((result) => {
                    if (result?.payload.success === true) {
                        ToastAndroid.show(result?.payload?.message, ToastAndroid.SHORT);
                    } else if (result?.payload.success === false) {
                        ToastAndroid.show(result?.payload?.message, ToastAndroid.SHORT);
                    }
                })
                setRules('');
            }
        } else {
            if (text.trim()) {

                const dataPayload = {
                    event_id: eventId,
                    description: text
                }
                const payload = {
                    data: dataPayload,
                    method: "POST"
                }
                dispatch(createDeleteMeetingPoints(payload)).then((result) => {
                    if (result?.payload.success === true) {
                        const { result: points } = result?.payload
                        setMeetingPoints([...meetingPoints, points]);
                        ToastAndroid.show(result?.payload?.message, ToastAndroid.SHORT);
                    } else if (result?.payload.success === false) {
                        ToastAndroid.show(result?.payload?.message, ToastAndroid.SHORT);
                        // showAlert("Error", "error", result?.payload?.message)
                    }
                })
                setText('');
            }
        }


    };

    const removeItem = (item, index) => {

        console.log(item)

        const payload = {
            meetingID: item?.id,
            method: "DELETE"
        }
        dispatch(createDeleteMeetingPoints(payload)).then((result) => {
            if (result?.payload.success === true) {
                showAlert("Success", "success", result?.payload?.message)
                const newItems = meetingPoints?.filter((_, i) => i !== index);
                setMeetingPoints(newItems);
            } else if (result?.payload.success === false) {
                showAlert("Error", "error", result?.payload?.message)
            }
        })

    };

    const removeActivity = (item, index) => {

        const payload = {
            method: "DELETE",
            activityId: item?.id
        }

        dispatch(addEventActivity(payload)).then((result) => {
            if (result?.payload.success === true) {
                showAlert("Success", "success", result?.payload?.message);
                const newItems = activityList?.filter((_, i) => i !== index);
                setActivityList(newItems);
                activitySheetRef?.current.close()
                resetActivity();
            } else if (result?.payload.success === false) {
                showAlert("Error", "error", result?.payload?.message);
            }
        });


    };

    const removeRulesItem = (index) => {
        const newItems = clubRules?.filter((_, i) => i !== index);
        setClubRules(newItems);
    };

    const removeMemberItem = (index) => {
        const newItems = memberList?.filter((_, i) => i !== index);
        setMemberList(newItems);
    };

    const resetMemberForm = () => {
        scheduleSheetRef?.current.close()
        setMemberEmail('')
        setDay('');
        setStartTime(new Date())
        setEndTime(new Date())
    }

    const resetRoute = () => {
        routeSheetRef?.current.close()
        setWaypoints([''])
        setStartPoint(null)
        setEndPoint(null)
    }

    const removeRoutes = (index) => {
        const newRoute = addedRoutes?.filter((_, i) => i !== index);
        setAddedRoutes(newRoute);
        setSelectedRoute(newRoute)
    };


    const handleSendInvitations = async (eventId) => {

        let successCount = 0;

        for (let i = 0; i < selectedItems?.length; i++) {
            const payload = {
                event_id: eventId,
                user_id: selectedItems[i].user_id,
                // email: emailsList[i].email
            };

            await dispatch(sendInvitation(payload)).then((result) => {
                if (result?.payload.success === true) {
                    successCount++; // Increment on success
                } else if (result?.payload.success === false) {
                    showAlert("Error", "error", result?.payload?.message);
                }
            });
        }

        for (let i = 0; i < emails?.length; i++) {
            const payload = {
                event_id: eventId,
                // user_id: emailsList[i].value,
                email: emails[i].email
            };

            await dispatch(sendInvitation(payload)).then((result) => {
                if (result?.payload.success === true) {
                    successCount++; // Increment on success
                } else if (result?.payload.success === false) {
                    showAlert("Error", "error", result?.payload?.message);
                }
            });
        }

        if (successCount === emails?.length) {
            showAlert("Success", "success", "All invitations sent successfully!");
            const timer = setTimeout(() => {
                // handleBackPress();
            }, 3000);
            return () => clearTimeout(timer);

        }
    };

    const pickImageFromGallery = () => {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
        }).then(image => {
            handleSheetClose();

            dispatch(uploadImage(image.path)).then((result) => {
                if (result?.payload) {
                    // Assuming result.payload contains the URL of the uploaded image
                    const uploadedImageUrl = result.payload;
                    setMediaImages([...mediaImages, uploadedImageUrl]);
                }
            }).catch(error => {
                console.error('Error uploading image:', error);
            });

            // setMediaImages([...mediaImages, image.path]);
        }).catch(error => {
            console.log('Error picking image: ', error);
        });
    };

    const pickImageFromCamera = () => {
        ImagePicker.openCamera({
            width: 600,
            height: 400,
        }).then(image => {
            handleSheetClose();

            dispatch(uploadImage(image.path)).then((result) => {
                if (result?.payload) {
                    // Assuming result.payload contains the URL of the uploaded image
                    const uploadedImageUrl = result.payload;
                    setMediaImages([...mediaImages, uploadedImageUrl]);
                }
            }).catch(error => {
                console.error('Error uploading image:', error);
            });

            // setMediaImages([...mediaImages, image.path]);
        }).catch(error => {
            console.log('Error capturing image: ', error);
        });
    };


    const handleSheetClose = () => {
        refRBSheet.current.close();
    };

    const handleSheetOpen = () => {
        refRBSheet.current.open();
    };

    const addImage = () => {
        setSheetView(0)
        handleSheetOpen()
    };

    const removeImage = (index) => {
        const newImages = [...mediaImages];
        newImages.splice(index, 1);
        setMediaImages(newImages);
    };

    const dataFormatter = (data) => {
        return data.map((item) => ({
            label: item?.name,
            value: item?.id,
        }));
    };

    const memberDataFormatter = (data) => {
        return data?.map((item) => ({
            label: item?.user_details?.username,
            value: item?.user_details?.id,
        }));
    };

    const handleSelect = (selectedValue) => {
        setSelectedClubId(selectedValue?.value)
    };

    const handleMemberSelect = (selectedValue) => {
        if (isPrivateEvent) {
            setInvitationData(selectedValue)
        }
    };

    const handleClubMemberPress = (item) => {
        console.log('Item pressed:', item);
    };

    const handleEmailChange = (id, value) => {
        const updatedEmails = emails.map(emailField =>
            emailField.id === id ? { ...emailField, email: value } : emailField
        );
        setEmails(updatedEmails);
    };

    const addEmailInput = () => {
        const newEmailInput = { id: emails.length + 1, email: '' };
        setEmails([...emails, newEmailInput]);
    };

    const handleRemoveEmail = (id, email) => {
        // Remove email from emailsList if it exists
        const updatedScheduleList = emailsList.filter(item => item.email !== email);
        setEmailList(updatedScheduleList);

        // Remove the email input
        const filteredEmails = emails.filter(emailField => emailField.id !== id);
        setEmails(filteredEmails.length > 0 ? filteredEmails : [{ id: emails.length + 1, email: '' }]);
    };

    const renderMemberRow = ({ item }) => {
        return (
            <View style={{
                paddingVertical: 10,
                padding: 8,
                backgroundColor: theme.colors.inputBg,
                borderRadius: 20,
                marginHorizontal: 5,
                marginTop: 10
            }}>
                <Text style={{
                    fontFamily: fonts.fontsType.medium,
                    fontSize: normalizeFontSize(14),
                    color: theme.colors.black
                }}>{item?.user_details?.username}</Text>
            </View>
        );
    };

    const createMemberInvitationSection = () => {
        return (
            <View>
                <TouchableOpacity onPress={() => { scheduleSheetRef?.current?.close() }} style={styles.backButton}>
                    <BackButton width={scaleWidth(40)} height={scaleHeight(40)} />
                </TouchableOpacity>
                <Text style={styles.heading}>
                    Send Invitations
                </Text>
                <CustomTextInput
                    label={"Member Email"}
                    identifier={'email'}
                    value={memberEmail}
                    onValueChange={setMemberEmail}
                    mainContainer={{ marginTop: scaleHeight(40) }}
                    autoCapitalize={'sentences'}
                />

                <Text style={[styles.label, { marginBottom: 20 }]}>{"Select Member"}</Text>
                <ListBottomSheet
                    apiUrl={`${API_BASE_URL}/membership/${data?.clubId ? data?.clubId : selectedClubId}/members`}
                    memberDataFormater={memberDataFormatter}
                    onSelect={handleMemberSelect}
                    isMember={true}
                />

                <Button
                    onPress={() => {
                        scheduleSheetRef?.current.close()
                        const modifyInvitation = { ...invitationData, email: memberEmail }
                        setMemberList([...memberList, modifyInvitation]);
                        resetMemberForm();
                    }}
                    title={"Add Member"}
                    customStyle={{ width: '100%', marginTop: '30%' }}
                />
            </View>
        );
    }


    const memberInvitationSec = () => {

        return (
            <View style={{ flex: 1 }}>

                <Text style={styles.heading}>
                    Send Invitation
                </Text>

                <View style={{ marginTop: 20, flex: 1 }}>

                    {
                        memberList?.map((item, index) => {
                            return <View key={index}>
                                <GoalsItem
                                    item={item?.label}
                                    onRemove={() => removeMemberItem(index)}
                                />
                            </View>
                        })
                    }

                    <ScrollView style={{ flex: 1 }}>

                        {emails.map((emailField, index) => (
                            <View key={emailField.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <CustomTextInput
                                    label={`Member Email ${index + 1}`}
                                    identifier={`email_${emailField.id}`}
                                    value={emailField.email}
                                    onValueChange={(value) => handleEmailChange(emailField.id, value)}
                                    mainContainer={{ marginTop: scaleHeight(10), flex: 1 }}
                                    autoCapitalize={'none'}
                                    customContainerStyle={{ width: '90%' }}
                                />

                                {index !== 0 && <TouchableOpacity
                                    style={{ position: 'absolute', top: 58, right: 0 }}
                                    onPress={() => { handleRemoveEmail(emailField.id, emailField.email) }}
                                >
                                    <AddIcon name="closecircle" size={24} color={theme.colors.error} />
                                </TouchableOpacity>}

                            </View>
                        ))}

                        <TouchableOpacity onPress={addEmailInput} style={{ position: 'absolute', right: 0, top: scaleHeight(55) }}>
                            <Icon name="add-circle-outline" size={28} color={theme.colors.textHeading} />
                        </TouchableOpacity>
                        {
                            selectedItems?.length > 0 && <Text style={styles.label}>
                                Selected Members
                            </Text>
                        }
                        <FlatList
                            data={selectedItems}
                            keyExtractor={(item, index) => item.toString() + index}
                            renderItem={renderMemberRow}
                            numColumns={3}
                            contentContainerStyle={{
                                marginTop: 10,
                            }}
                        />


                        <Button
                            onPress={() => {
                                membersSheet.current?.open();
                            }}
                            title={"Select Members"}
                            customStyle={{
                                width: '70%',
                                backgroundColor: theme.colors.transparent,
                                borderColor: '#888888',
                                borderStyle: 'dashed',
                                borderWidth: 2,
                            }}
                            textCustomStyle={{
                                color: '#888888',
                            }}
                        />

                        <CustomSheet
                            ref={membersSheet}
                            isHeader={true}
                            title={'Select Members'}
                            height={700}
                        >
                            <FlatList
                                data={uniqueClubMembers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <ClubMembersItem
                                        item={item}
                                        onPress={handleClubMemberPress}
                                        selectedItems={selectedItems}
                                        setSelectedItems={setSelectedItems}
                                    />
                                )}
                            />

                            {clubMembers?.length > 0 && <Button
                                onPress={() => {
                                    membersSheet?.current?.close();
                                }}
                                title={'Done'}
                            />}
                        </CustomSheet>
                    </ScrollView>

                    {/* <RBSheet
                        ref={scheduleSheetRef}
                        height={height}
                        openDuration={250}
                        customStyles={{ container: styles.scheduleSheet }}
                        closeOnPressBack={true}
                    >

                        {createMemberInvitationSection()}

                    </RBSheet>

                    <Button
                        onPress={() => {
                            scheduleSheetRef?.current.open()
                        }}
                        title={"Add Member"}
                        customStyle={styles.addGoalStyle}
                        textCustomStyle={{
                            color: '#888888',
                        }}
                    /> */}

                </View>

                <Button
                    loading={invitationLoader}
                    onPress={() => { handleSendInvitations(eventId) }}
                    title={"Send Invitaion"}
                    customStyle={{ marginBottom: 10 }}
                />


            </View>
        )

    }

    const createEventSection = () => {

        return (
            <View style={{ flex: 1 }}>
                <CustomLayout>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.heading}>
                            Update Event
                        </Text>

                        {addMediaSection()}
                        {!data?.clubId && <>
                            <Text style={styles.label}>{"Select Club"}</Text>
                            <ListBottomSheet
                                apiUrl={`${API_BASE_URL}/clubs`}
                                dataFormatter={dataFormatter}
                                onSelect={handleSelect}
                            />
                            {/* <CustomDropdown
                            apiUrl={`${API_BASE_URL}/clubs`}
                            dataFormatter={dataFormatter}
                            placeholder=""
                            searchPlaceholder="Type to search..."
                            searchEnabled={true}
                            onSelect={handleSelect}
                            dropdownStyle={styles.customDropdownStyle}
                            searchTextStyle={styles.customSearchTextStyle}
                        /> */}

                        </>}

                        <CustomTextInput
                            label={"Name of Event"}
                            identifier={'event_name'}
                            value={name}
                            onValueChange={(value) => {
                                setName(value);
                                if (value) {
                                    setErrors((prevErrors) => ({ ...prevErrors, name: '' }));
                                } else {
                                    setErrors((prevErrors) => ({ ...prevErrors, name: 'Event name is required' }));
                                }
                            }}
                            customContainerStyle={styles.customInput}
                            autoCapitalize={'sentences'}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        <CustomTextInput
                            label={"Event Type"}
                            identifier={'event_type'}
                            value={eventType}
                            onValueChange={(value) => {
                                setEventType(value);
                                if (value) {
                                    setErrors((prevErrors) => ({ ...prevErrors, eventType: '' }));
                                } else {
                                    setErrors((prevErrors) => ({ ...prevErrors, eventType: 'Event Type is required' }));
                                }
                            }}
                            customContainerStyle={styles.customInput}
                            autoCapitalize={'sentences'}
                        />
                        {errors.eventType && <Text style={styles.errorText}>{errors.eventType}</Text>}

                        <CustomTextInput
                            label={"Description"}
                            identifier={'description'}
                            customContainerStyle={styles.customInput}
                            autoCapitalize={'sentences'}
                            multiline={true}
                            value={description}
                            onValueChange={(value) => {
                                setDescription(value);
                                if (value) {
                                    setErrors((prevErrors) => ({ ...prevErrors, description: '' }));
                                } else {
                                    setErrors((prevErrors) => ({ ...prevErrors, description: 'Description is required' }));
                                }
                            }}
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                        <DynamicDatePicker
                            label="Start Time"
                            date={startTime}
                            mode="time"
                            format="hh:mm A"
                            openSheetRef={startTimeSheetRef}
                            onDateChange={setStartTime}
                            onConfirm={() => console.log('Start time confirmed!')}
                        />

                        <DynamicDatePicker
                            label="Start Date"
                            date={startDate}
                            mode="date"
                            format="DD-MM-YYYY"
                            openSheetRef={startDateSheetRef}
                            onDateChange={setStartDate}
                            onConfirm={() => console.log('Start date confirmed!')}
                        />

                        {/* <DynamicDatePicker
                        label="End Time"
                        date={endTime}
                        mode="time"
                        format="hh:mm A"
                        openSheetRef={endTimeSheetRef}
                        onDateChange={setEndTime}
                        onConfirm={() => console.log('End time confirmed!')}
                    /> */}

                        <DynamicDatePicker
                            label="End Date"
                            date={endDate}
                            mode="date"
                            format="DD-MM-YYYY"
                            openSheetRef={endDateSheetRef}
                            onDateChange={setEndDate}
                            onConfirm={() => console.log('End date confirmed!')}
                        />

                        <CustomToggleSwitch
                            isEnabled={isPrivateEvent}
                            toggleSwitch={togglePrivateSwitch}
                            label="Private Event"
                            style={{ marginTop: 20 }}
                        />

                        <CustomToggleSwitch
                            isEnabled={isPaidEvent}
                            toggleSwitch={togglePaidSwitch}
                            label="Paid Event"
                            style={{ marginTop: 20 }}
                        />

                        {
                            isPaidEvent && <>
                                <CustomTextInput
                                    label={"Event Fee"}
                                    identifier={'event_fee'}
                                    value={eventFee}
                                    onValueChange={(value) => {
                                        setEventFee(value);
                                        if (value) {
                                            setErrors((prevErrors) => ({ ...prevErrors, eventFee: '' }));
                                        } else {
                                            setErrors((prevErrors) => ({ ...prevErrors, eventFee: 'Event fee is required for paid event' }));
                                        }
                                    }}
                                    inputType={'number-pad'}
                                    customContainerStyle={[styles.customInput]}
                                    mainContainer={{ marginTop: 15 }}
                                />
                                {errors.eventFee && <Text style={styles.errorText}>{errors.eventFee}</Text>}
                            </>
                        }

                        <CustomTextInput
                            label={"Distance in (km)"}
                            identifier={'distance'}
                            value={distance}
                            onValueChange={(value) => {
                                setDistance(value);
                                if (value) {
                                    setErrors((prevErrors) => ({ ...prevErrors, distance: '' }));
                                } else {
                                    setErrors((prevErrors) => ({ ...prevErrors, distance: 'Distance is required' }));
                                }
                            }}
                            inputType={'number-pad'}
                            customContainerStyle={[styles.customInput]}
                            mainContainer={{ marginTop: 10 }}
                        />
                        {errors.distance && <Text style={styles.errorText}>{errors.distance}</Text>}
                    </View>

                </CustomLayout>

                <Button
                    loading={loading}
                    onPress={handleEventCreate}
                    title={"Update"}
                    customStyle={{ marginBottom: 10 }}
                />
            </View>

        )

    }

    const renderRouteView = () => {

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.searchBox}>
                    <GooglePlacesAutocomplete
                        placeholder="Start Point"
                        onPress={(data, details = null) => onPlaceSelected(details, 'start')}
                        query={{
                            key: GOOGLE_API_KEY,
                            language: 'en',
                        }}
                        fetchDetails
                        styles={{
                            container: { flex: 0, width: width * 0.9 },
                            listView: { backgroundColor: 'white' },
                            textInputContainer: { backgroundColor: 'transparent' },
                            textInput: [
                                styles.googleInput,
                                focusedInput === 'start' && styles.focusedInput, // Change styles on focus
                            ],
                        }}
                        textInputProps={{
                            placeholderTextColor: focusedInput === 'start' ? theme.colors.labelColors : theme.colors.placeholderColor,
                            onFocus: () => setFocusedInput('start'),
                            onBlur: () => setFocusedInput(null),
                        }}
                    />
                    <GooglePlacesAutocomplete
                        placeholder="End Point"
                        onPress={(data, details = null) => onPlaceSelected(details, 'end')}
                        query={{
                            key: GOOGLE_API_KEY,
                            language: 'en',
                        }}
                        fetchDetails
                        styles={{
                            container: { flex: 0, width: width * 0.9 },
                            listView: { backgroundColor: 'white' },
                            textInputContainer: { backgroundColor: 'transparent' },
                            textInput: [
                                styles.googleInput,
                                focusedInput === 'end' && styles.focusedInput, // Change styles on focus
                            ],
                        }}
                        textInputProps={{
                            placeholderTextColor: focusedInput === 'end' ? theme.colors.labelColors : theme.colors.placeholderColor,
                            onFocus: () => setFocusedInput('end'),
                            onBlur: () => setFocusedInput(null),
                        }}
                    />
                    <View style={{}}>
                        {waypoints?.map((waypoint, index) => (
                            <View
                                key={index}
                            >

                                <GooglePlacesAutocomplete
                                    key={index}
                                    placeholder={`Waypoint ${index + 1}`}
                                    onPress={(data, details = null) => onPlaceSelected(details, 'waypoint', index)}
                                    query={{ key: GOOGLE_API_KEY, language: 'en' }}
                                    fetchDetails
                                    styles={{
                                        container: { flex: 0, width: '95%' },
                                        textInput: [
                                            styles.googleInput,
                                            focusedInput === `waypoint-${index}` && styles.focusedInput, // Change styles on focus
                                        ],
                                    }}
                                    textInputProps={{
                                        placeholderTextColor: focusedInput === `waypoint-${index}` ? theme.colors.labelColors : theme.colors.placeholderColor,
                                        onFocus: () => setFocusedInput(`waypoint-${index}`),
                                        onBlur: () => setFocusedInput(null),
                                    }}
                                />

                                {index !== 0 && <TouchableOpacity
                                    style={styles.removeWaypoints}
                                    onPress={() => handleRemoveWaypoint(index)}
                                >
                                    <AddIcon name="closecircle" size={24} color={theme.colors.error} />
                                </TouchableOpacity>}

                            </View>

                        ))}

                        {/* Single Add Waypoint Button */}
                        <TouchableOpacity style={styles.removeWaypoints} onPress={handleAddWaypoint}>
                            <AddIcon name="pluscircle" size={24} color={theme.colors.textHeading} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.mapContainer}>

                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: currentLocation?.latitude || 37.78825,
                            longitude: currentLocation?.longitude || -122.4324,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}

                    >
                        {currentLocation && !startPoint && (
                            <Marker
                                coordinate={currentLocation}
                                title="Current Location"
                            />
                        )}
                        {startPoint && <Marker tracksViewChanges={false} coordinate={startPoint} title={`Start\t\tElevation ${startPoint?.elevation}`} >
                            <View>
                                <Image style={styles.marker} source={mapMarker} />
                            </View>

                            {/* <Callout
                    tooltip={true}>
                    <MarkerCallout point={"Start"} elevation={startPoint?.elevation} />
                </Callout> */}
                        </Marker>}
                        {endPoint && <Marker tracksViewChanges={false} coordinate={endPoint} title={`End\t\tElevation ${endPoint?.elevation}`}>
                            <View>
                                <Image style={styles.marker} source={mapMarker} />
                            </View>
                            {/* <Callout
                    tooltip={true}>
                    <MarkerCallout point={"End"} elevation={endPoint?.elevation} />
                </Callout> */}
                        </Marker>}
                        {/* {wayPoints?.map((point, index) => (
                <Marker key={`waypoint-${index}`} coordinate={point} title={`Waypoint ${index + 1}`} >
                    <WaypointIcon />
                </Marker>
            ))} */}

                        {waypoints?.map((point, index) => (
                            point.latitude && (
                                <Marker
                                    tracksViewChanges={false}
                                    key={`waypoint-${index}`}
                                    coordinate={point}
                                    title={`Waypoint ${index + 1}\t\t${point?.elevation}`} >
                                    <WaypointIcon />
                                </Marker>
                            )
                        ))}
                        {startPoint && endPoint && (
                            <MapViewDirections
                                origin={startPoint}
                                destination={endPoint}
                                // waypoints={wayPoints}
                                waypoints={waypoints}
                                apikey={GOOGLE_API_KEY}
                                strokeWidth={3}
                                strokeColor={theme.colors.secondary}
                            />
                        )}
                    </MapView>

                </View>
                <Button
                    loading={routeLoader}
                    onPress={() => {

                        handleCreateClubRoute()
                    }}
                    title={"Save Route"}
                    customStyle={{ width: '100%', }}
                />

            </View>
        );

    }

    const addRoutes = () => {

        return (
            <View style={{
                flex: 1,

            }}>
                <Text style={styles.heading}>
                    Update Routes
                </Text>


                <View style={{ marginTop: 20, flex: 1 }}>


                    {
                        addedRoutes?.map((item, index) => {
                            return <View key={index}>
                                <AddRouteItem
                                    startLoc={item?.start_loc_name}
                                    endLoc={item?.end_loc_name}
                                    onRemove={() => removeRoutes(index)}
                                    isPressable={true}
                                    isSelected={selectedRoutes?.some(selectedItem => selectedItem.id === item.id)}
                                    onSelectionChange={(isSelected) => handleRouteSelection(item, isSelected)}
                                />
                            </View>
                        })
                    }

                    <RBSheet
                        ref={routeSheetRef}
                        height={height}
                        openDuration={250}
                        customStyles={{ container: styles.scheduleSheet }}
                        closeOnPressBack={true}
                    >

                        {renderRouteView()}

                    </RBSheet>

                    <Button
                        onPress={() => {
                            routeSheetRef?.current.open()
                        }}
                        title={"Add Route"}
                        customStyle={styles.addGoalStyle}
                        textCustomStyle={{
                            color: '#888888',
                        }}
                    />

                </View>

                <Button
                    loading={loading}
                    onPress={handleEventCreate}
                    title={"Update"}
                    customStyle={{ marginBottom: 10, }}
                />
            </View>
        )

    }

    const addMediaSection = () => {

        return (
            <View style={styles.mediaImageContainer}>
                {mediaImages?.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        {loadingImages[index] && (
                            <FullScreenLoader
                                indicatorSize={40}
                                customIndicatorContainer={styles.loader}
                                loading={loadingImages[index]} />
                        )}
                        <Image
                            source={{ uri: image?.secure_url }}
                            style={styles.mediaImage}
                            onLoadStart={() => handleImageLoadStart(index)}
                            onLoadEnd={() => handleImageLoadEnd(index)}
                        />
                        <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                            <Cross name='cross' size={16} color={theme.colors.white} />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={styles.addButton} onPress={addImage}>
                    <Cross name='plus' size={24} color={"#888888"} />
                </TouchableOpacity>
            </View>
        )

    }

    const addMeetingSection = () => {

        return (
            <View>
                {/* <Image style={styles.image} source={addGoalsImg} /> */}
                <Text style={styles.heading}>
                    Update Meeting Points
                </Text>

                {/* <Text style={[styles.heading, {
                    fontSize: normalizeFontSize(14),
                    color: theme.colors.lightGrey,
                    width: '70%',
                    marginTop: scaleHeight(10),
                }]}>
                    This will be shown in your Profile as a goals.
                </Text> */}

                <View style={{ marginTop: 20 }}>
                    {
                        meetingPoints?.map((item, index) => {
                            return <View key={index}>
                                <GoalsItem
                                    item={item?.description}
                                    onRemove={() => removeItem(item, index)}
                                />
                            </View>
                        })
                    }

                    <Button
                        onPress={() => {
                            setType("goals")
                            setSheetView(1)
                            handleSheetOpen()
                        }}
                        title={"Add Points"}
                        customStyle={styles.addGoalStyle}
                        textCustomStyle={{
                            color: '#888888',
                        }}
                    />

                </View>


            </View>
        )

    }

    const renderActivityLocationForm = () => {

        return <View style={{
            flex: 1,
            marginTop: 30
        }}>
            <GooglePlacesAutocomplete
                placeholder="Add Location"
                onPress={(data, details = null) => onPlaceSelected(details, 'activity_location')}
                query={{
                    key: GOOGLE_API_KEY,
                    language: 'en',
                }}
                fetchDetails
                styles={{
                    container: { flex: 0, width: width * 0.9 },
                    listView: { backgroundColor: 'white' },
                    textInputContainer: { backgroundColor: 'transparent' },
                    textInput: [
                        [styles.googleInput, styles.eventLocation],
                        focusedInput === 'activity_location' && styles.focusedInput,
                    ],
                }}
                textInputProps={{
                    placeholderTextColor: focusedInput === 'activity_location' ? theme.colors.labelColors : theme.colors.placeholderColor,
                    onFocus: () => setFocusedInput('activity_location'),
                    onBlur: () => setFocusedInput(null),
                }}
            />

            <View style={[styles.mapContainer, { marginTop: '5%' }]}>

                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: currentLocation?.latitude || 37.78825,
                        longitude: currentLocation?.longitude || -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}

                >
                    {(activityLocation || currentLocation) && (
                        <Marker
                            coordinate={activityLocation || currentLocation}
                            title="Selected Location"
                        />
                    )}
                </MapView>
            </View>

            <Button

                onPress={() => {
                    locationSheetRef?.current?.close()
                }}
                title={"Save Location"}
                customStyle={{ width: '100%', }}
            />

        </View>

    }

    const resetActivity = () => {
        setActivityDescription('');
        setActivityName('');
        setActivityLocation(null)
    }

    const handleSaveActivity = () => {

        const payload = {
            event_id: eventId,
            name: activityName,
            description: activityDescription,
            location: activityLocation?.location_name,
            lat: activityLocation?.latitude,
            long: activityLocation?.longitude
        }

        const finalPayload = {
            data: payload,
            method: 'POST'
        }

        dispatch(addEventActivity(finalPayload)).then((result) => {
            if (result?.payload.success === true) {
                showAlert("Success", "success", result?.payload?.message);
                setActivityList([...activityList, result?.payload?.result]);
                activitySheetRef?.current.close()
                resetActivity();
            } else if (result?.payload.success === false) {
                showAlert("Error", "error", result?.payload?.message);
            }
        });

    }

    const renderActivityForm = () => {

        return <View>
            <TouchableOpacity onPress={() => { activitySheetRef?.current?.close() }} style={styles.backButton}>
                <BackButton width={scaleWidth(40)} height={scaleHeight(40)} />
            </TouchableOpacity>
            <Text style={styles.heading}>
                Add Activity
            </Text>
            <CustomTextInput
                label={"Activity Name"}
                identifier={'activity_name'}
                value={activityName}
                onValueChange={(value) => {
                    setActivityName(value);
                    if (value) {
                        setActivityErrors((prevErrors) => ({ ...prevErrors, activityName: '' }));
                    } else {
                        setActivityErrors((prevErrors) => ({ ...prevErrors, activityName: 'Activity name is required' }));
                    }

                }}
                customContainerStyle={styles.customInput}
                autoCapitalize={'sentences'}
            />
            {/* {activityErrors.activityName && <Text style={styles.errorText}>{activityErrors.activityName}</Text>} */}

            <CustomTextInput
                label={"Activity Description"}
                identifier={'activity_description'}
                customContainerStyle={styles.customInput}
                autoCapitalize={'sentences'}
                multiline={true}
                value={activityDescription}
                onValueChange={(value) => {
                    setActivityDescription(value);
                    if (value) {
                        setActivityErrors((prevErrors) => ({ ...prevErrors, activityDescription: '' }));
                    } else {
                        setActivityErrors((prevErrors) => ({ ...prevErrors, activityDescription: 'Activity Description is required' }));
                    }
                }}
            />
            {/* {activityErrors.activityDescription && <Text style={styles.errorText}>{activityErrors.activityDescription}</Text>} */}

            <Text style={styles.label}>{"Add Location"}</Text>
            <TouchableOpacity onPress={() => locationSheetRef.current?.open()} style={styles.placeholderButton}>
                <Text style={styles.placeholderText}>
                    {activityLocation?.location_name}
                </Text>
            </TouchableOpacity>


            <RBSheet
                ref={locationSheetRef}
                height={height}
                openDuration={250}
                customStyles={{ container: styles.scheduleSheet }}
                closeOnPressBack={true}
            >

                {renderActivityLocationForm()}

            </RBSheet>


            <Button
                loading={activityLoader}
                onPress={() => {
                    handleSaveActivity()
                }}
                title={"Save Activity"}
                customStyle={{ width: '100%', marginTop: '30%' }}
            />
        </View>



    }

    const addEventActivitySection = () => {

        return (
            <View>

                <Text style={styles.heading}>
                    Update Event Activities
                </Text>

                <View style={{ marginTop: 20 }}>

                    {
                        activityList?.map((item, index) => {
                            return <View key={index} style={styles.card}>
                                <TouchableOpacity style={styles.crossButton}
                                    onPress={() => {
                                        removeActivity(item, index)
                                    }}>
                                    <Icon name="close" size={26} color="black" />
                                </TouchableOpacity>

                                <Text style={styles.title}>
                                    {item?.name}
                                </Text>
                                <Text style={[styles.time, { fontFamily: fonts.fontsType.medium, fontSize: 14 }]}>
                                    {`Description :`}
                                    <Text style={styles.time}>
                                        {` ${item?.description}`}
                                    </Text>
                                </Text>
                                <Text style={[styles.time, { fontFamily: fonts.fontsType.medium, fontSize: 14 }]}>
                                    {`Location :`}
                                    <Text style={styles.time}>
                                        {` ${item?.location}`}
                                    </Text>
                                </Text>
                            </View>
                        })
                    }


                    <RBSheet
                        ref={activitySheetRef}
                        height={height}
                        openDuration={250}
                        customStyles={{ container: styles.scheduleSheet }}
                        closeOnPressBack={true}
                    >

                        {renderActivityForm()}

                    </RBSheet>


                    <Button
                        onPress={() => {
                            activitySheetRef?.current?.open()
                        }}
                        title={"Add Activity"}
                        customStyle={styles.addGoalStyle}
                        textCustomStyle={{
                            color: '#888888',
                        }}
                    />

                </View>


            </View>
        )

    }


    const selectInterestsSection = () => {

        return (
            <View style={{ flex: 1 }}>

                <Text style={[styles.heading, { width: '55%' }]}>
                    Update interests
                </Text>
                <View style={{ marginTop: 30, flex: 1 }}>
                    <InterestList
                        interests={finalCategory}
                        //interests={categories?.subCategory}
                        onSelectionChange={handleSelectionChange}
                    />
                </View>

                <Button
                    loading={loading}
                    onPress={handleEventCreate}
                    title={"Update"}
                    customStyle={{ marginBottom: 10 }}
                />
            </View>
        )

    }

    const photoSelectorView = () => {

        return (
            <View>
                <Button
                    onPress={() => { pickImageFromCamera() }}
                    title={"Capture from camera"}
                    icon={<Icon name="camera-alt" type="material" size={24} color={theme.colors.greyShade} />}
                    customStyle={styles.button}
                    textCustomStyle={{ color: theme.colors.greyShade }}
                    customIconStyle={styles.customIconStyle}
                />

                <Button
                    onPress={() => { pickImageFromGallery() }}
                    title={"Upload from gallery"}
                    icon={<Icon name="insert-photo" type="material" size={24} color={theme.colors.greyShade} />}
                    customStyle={styles.button}
                    textCustomStyle={{ color: theme.colors.greyShade }}
                    customIconStyle={styles.customIconStyle}
                />

                <Button
                    onPress={handleSheetClose}
                    title={"Cancel"}
                    customStyle={[styles.button, { backgroundColor: theme.colors.transparent, marginBottom: 0 }]}
                    textCustomStyle={{ color: theme.colors.white }}
                />
            </View>
        )

    }

    const addGoalsItemView = () => {

        return (
            <View style={{ padding: 20, flex: 1 }}>

                <View style={{ flexDirection: 'row' }}>

                    <Text style={{
                        fontFamily: fonts.fontsType.bold,
                        fontSize: normalizeFontSize(16),
                        color: theme.colors.white,
                        flex: 1
                    }}>
                        {sheetTitle}
                    </Text>

                    <TouchableOpacity onPress={handleSheetClose}>
                        <CloseIcon width={24} height={24} />
                    </TouchableOpacity>


                </View>

                {
                    type === 'rules' ? <CustomTextInput
                        identifier={'add_rules'}
                        value={rules}
                        onValueChange={setRules}
                        multiline={true}
                        autoCapitalize='sentences'
                    /> : <CustomTextInput
                        identifier={'add_goal'}
                        value={text}
                        onValueChange={setText}
                        multiline={true}
                        autoCapitalize='sentences'
                    />
                }



                <View style={{ flexDirection: 'row', marginTop: scaleHeight(10), marginBottom: scaleHeight(30) }}>
                    <Button
                        onPress={() => { addMore() }}
                        title={"ADD MORE"}
                        customStyle={{
                            width: '48%',
                            backgroundColor: theme.colors.textHeading,
                        }}
                        textCustomStyle={{ color: theme.colors.black }}
                    />

                    <Button
                        onPress={() => { addGoal() }}
                        title={"CONFIRM"}
                        customStyle={{ width: '48%', marginHorizontal: '2%', backgroundColor: theme.colors.textHeading }}
                        textCustomStyle={{ color: theme.colors.black }}
                    />

                </View>
            </View>
        )

    }

    const renderSheetView = () => {
        switch (sheetView) {
            case 0:
                return (
                    photoSelectorView()
                );
            case 1:
                return (
                    addGoalsItemView()
                );
            default:
                return (
                    photoSelectorView()
                );
        }

    }

    const renderBottomSheet = () => {
        return <RBSheet
            ref={refRBSheet}
            openDuration={1000}
            customStyles={{
                wrapper: styles.wrapper,
                container: [styles.sheetContainer,
                { backgroundColor: theme.colors.primary }, sheetView === 1 && { height: keyboardStatus ? '60%' : '37%' }]
            }}
        >

            {renderSheetView()}

        </RBSheet>
    }

    const renderAddLocation = () => {
        return <View style={{
            flex: 1,

        }}>
            <Text style={[styles.heading, { marginBottom: 20 }]}>
                Update Location
            </Text>
            <GooglePlacesAutocomplete
                placeholder="Add Location"
                onPress={(data, details = null) => onPlaceSelected(details, 'event_location')}
                query={{
                    key: GOOGLE_API_KEY,
                    language: 'en',
                }}
                fetchDetails
                styles={{
                    container: { flex: 0, width: width * 0.9 },
                    listView: { backgroundColor: 'white' },
                    textInputContainer: { backgroundColor: 'transparent' },
                    textInput: [
                        [styles.googleInput, styles.eventLocation],
                        focusedInput === 'event_location' && styles.focusedInput,
                    ],
                }}
                textInputProps={{
                    placeholderTextColor: focusedInput === 'event_location' ? theme.colors.labelColors : theme.colors.placeholderColor,
                    onFocus: () => setFocusedInput('event_location'),
                    onBlur: () => setFocusedInput(null),
                }}
            />

            <View style={[styles.mapContainer, { marginTop: '5%' }]}>

                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: eventLocation?.latitude || currentLocation?.latitude || 37.78825,
                        longitude: eventLocation?.longitude || currentLocation?.longitude || -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}

                >
                    {(eventLocation || currentLocation) && (
                        <Marker
                            coordinate={eventLocation || currentLocation}
                            title="Selected Location"
                        />
                    )}
                </MapView>
            </View>

            <Button
                loading={loading}
                onPress={handleEventCreate}
                title={"Update"}
                customStyle={{ marginBottom: 10 }}
            />

        </View>
    }

    const renderSelectedView = () => {
        switch (selectedView?.id) {
            case '0':
                return (
                    createEventSection()
                );
            case '1':
                return (
                    renderAddLocation()
                );
            case '2':
                return (
                    addRoutes()
                );
            case '3':
                return (
                    selectInterestsSection()
                );
            case '4':
                return (
                    addMeetingSection()
                );
            case '5':
                return (
                    addEventActivitySection()
                );
            case '6':
                return (
                    memberInvitationSec()
                );
            default:
                return null;
        }
    };

    const handleItemPress = (id) => {
        setSelectedView(id);
    };


    const showLoader = () => {
        return <FullScreenLoader
            loading={duplicateEventLoader} />;
    };


    return (
        <SafeAreaView style={styles.container}>


            <Header
                onBackPress={handleBackPress}
                isBackIcon={true}
                title={selectedView === null ? 'Event Updation' : ''}
                customHeaderStyle={{
                    paddingHorizontal: -8,
                    elevation: 0,
                }}
            />

            {selectedView === null ? (
                items.map((item, index) => (
                    <ItemWithEditAction
                        key={index}
                        label={item?.label}
                        onItemPress={() => handleItemPress(item)}
                        containerStyle={{
                            marginHorizontal: 5
                        }}
                    />
                ))
            ) : (
                renderSelectedView()
            )}

            {renderBottomSheet()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.colors.primary
    },
    image: {
        width: scaleWidth(140),
        height: scaleHeight(140),
        alignSelf: 'center'
    },
    heading: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(24),
        color: theme.colors.textHeading,
        alignSelf: 'center',
        textAlign: 'center',
        // marginTop: scaleHeight(20),
        width: '70%'
    },
    sectionContainer: {

    },
    customInput: {
        marginTop: scaleHeight(20)
    },
    ageContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: scaleHeight(30),
    },
    toggleStyle: {
        position: 'absolute',
        top: '88%',
        right: '27%'
    },
    imageContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        alignSelf: 'center'
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    changeButton: {
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        width: '25%',
        marginBottom: 0,
        height: 35
    },
    button: {
        width: '85%',
        marginBottom: 0,
        marginTop: scaleHeight(20),
        backgroundColor: '#656565',
        borderRadius: 10,
        height: scaleHeight(55)
    },
    wrapper: {
        backgroundColor: 'rgba(128, 128, 128, 0.80)',
    },
    sheetContainer: {
        borderTopEndRadius: 30,
        borderTopStartRadius: 30,
        width: '100%',
        alignSelf: 'center',
    },
    customIconStyle: {
        marginRight: 5,
        left: scaleWidth(0)
    },
    mediaImageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: scaleHeight(20),
    },
    imageWrapper: {
        position: 'relative',
        margin: 5,
    },
    mediaImage: {
        width: 100,
        height: 110,
        borderRadius: 20,
    },
    removeButton: {
        position: 'absolute',
        top: 2,
        right: 3,
        backgroundColor: 'red',
        borderRadius: 15,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 100,
        height: 110,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#888888',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderStyle: 'dashed'

    },
    addGoalStyle: {
        width: '70%',
        backgroundColor: theme.colors.transparent,
        borderColor: '#888888',
        borderStyle: 'dashed',
        borderWidth: 2,
        marginTop: 30
    },
    map: {
        ...StyleSheet.absoluteFillObject,

    },
    searchBox: {
        //position: 'absolute',
        top: 20,
        width: width * 0.9,
    },
    marker: {
        width: scaleWidth(40),
        height: scaleHeight(40)
    },
    mapContainer: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        // height: '70%',
        marginTop: '10%',
    },
    googleInput: {
        fontSize: scaleHeight(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.labelColors,
        backgroundColor: theme.colors.inputBg,
        borderRadius: 30,
        padding: 10
    },
    dateButton: {
        height: 45,
        backgroundColor: theme.colors.inputBg,
        borderRadius: 20,
        marginVertical: 10,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    dateText: {
        color: theme.colors.white,
        fontSize: normalizeFontSize(16),
        fontFamily: fonts.fontsType.medium,
    },
    bottomSheet: {
        padding: 20,
    },
    scheduleSheet: {
        backgroundColor: theme.colors.primary,
        padding: 20
    },
    label: {
        marginTop: 16,
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(14),
        color: theme.colors.white,
        marginHorizontal: 10,
    },
    pickerContainer: {
        height: 45,
        backgroundColor: theme.colors.inputBg,
        borderRadius: 20,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10
    },
    picker: {
        height: 45,
        width: '100%',
        color: theme.colors.white,
    },
    pickerItem: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
    },
    pickerWrapper: {
        justifyContent: 'center',  // Center the content
        alignItems: 'center',
        flex: 1,  // Make sure the content takes full height of the sheet
    },
    focusedInput: {
        borderWidth: 1,
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.secondary,
        color: theme.colors.white,
    },
    removeWaypoints: {
        position: 'absolute',
        right: -10,
        top: 10
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    eventLocation: {
        color: theme.colors.white,
        paddingHorizontal: 20,
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(14)
    },
    errorText: {
        color: theme.colors.error,
        marginHorizontal: 10,
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(12),
        marginTop: 5,
        marginBottom: 5,
    },
    placeholderButton: {
        backgroundColor: theme.colors.inputBg,
        borderRadius: 30,
        height: 45,
        paddingHorizontal: 20,
        marginTop: 10

    },
    placeholderText: {
        fontSize: normalizeFontSize(14),
        color: theme.colors.white,
        fontFamily: fonts.fontsType.medium,

    },
    card: {
        backgroundColor: theme.colors.inputBg,
        borderRadius: 8,
        padding: 8,
        marginVertical: 8,

    },
    crossButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
    },
    title: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.textHeading,
        marginBottom: 4,
    },
    time: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.regular,
        color: theme.colors.white,

    },
    info: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.regular,
        color: theme.colors.labelColors,
    },
});


export default UpdateEvent;
