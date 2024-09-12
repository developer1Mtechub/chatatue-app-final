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
import { uploadImage, uploadSvg } from '../../../redux/cloudinarySlice';
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
import { Award1, Award10, Award11, Award2, Award3, Award4, Award5, Award6, Award7, Award8, Award9, Cash1, Cash2, Cash3, Cash4, Cash5 } from '../../../assets/badges';
import AddedBadges from '../../../components/AddedBadges';
import { createDeleteBadge } from '../../../redux/EventSlices/createDeleteBadgeSlice';
import { color } from 'react-native-reanimated';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomSheet from '../../../components/CustomSheet';
import ClubItems from '../../../components/ClubItems';
import { getAllClubs } from '../../../redux/ClubCreation/getAllClubsSlice';
import { getClubMembers } from '../../../redux/ManageClub/getClubMembersSlice';
import ClubMembersItem from '../../../components/ClubMembersItem';
import assets from '../../../constant/assets';


const { width, height } = Dimensions.get('window');

const EventCreation = ({ navigation }) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { categories } = useSelector((state) => state.categories)
    const { loading } = useSelector((state) => state.createEvent)
    const { loading: routeLoader } = useSelector((state) => state.createClubRoute)
    const { loading: invitationLoader } = useSelector((state) => state.sendInvitation)
    const { loading: activityLoader } = useSelector((state) => state.addEventActivity)
    const { loading: duplicateEventLoader } = useSelector((state) => state.getEventDetail)
    const { loading: badgeLoader } = useSelector((state) => state.createDeleteBadge)
    const { clubMembers } = useSelector((state) => state.getClubMembers)
    const { clubs } = useSelector((state) => state.getAllClubs);
    const { user_id, role } = useSelector((state) => state.auth)
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
    const [goalsItem, setGoalsItem] = useState([]);
    const [addedBadges, setAddedBadges] = useState([]);
    const [clubRules, setClubRules] = useState([]);
    const [addedRoutes, setAddedRoutes] = useState([]);
    const [scheduleList, setScheduleList] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [scheduleName, setScheduleName] = useState('');
    const [emails, setEmails] = useState([{ id: 1, email: '' }]);
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
    const [badgeType, setBadgeType] = useState('');
    const [badgeTitle, setBadgeTitle] = useState('');
    const [clubName, setClubName] = useState('');
    // const [clubMembers, setClubMembers] = useState([])
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const startTimeSheetRef = useRef();
    const startDateSheetRef = useRef();
    const endTimeSheetRef = useRef();
    const endDateSheetRef = useRef();

    const scheduleSheetRef = useRef();
    const routeSheetRef = useRef();
    const activitySheetRef = useRef();
    const locationSheetRef = useRef();

    const badgesListSheet = useRef();
    const addBadgesSheet = useRef();
    const clubSheet = useRef();
    const invitationSheet = useRef();
    const membersSheet = useRef();
    const filteredClubs = clubs?.filter(club => club.creator.id === user_id);
    const uniqueClubMembers = Array.from(
        new Map(clubMembers?.map(member => [member.id, member])).values()
    );

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

    const [text, setText] = useState('');
    const [rules, setRules] = useState('');
    const [clubId, setClubId] = useState(null);
    const [eventId, setEventId] = useState(null);
    const refRBSheet = useRef();
    const addLocationSheet = useRef();
    const mapRef = useRef(null);
    const ref = useRef();
    // const buttonTitle = currentStep == 3 ? "Create Event" : "Continue"
    const buttonTitle = "Continue"
    const sheetTitle = type === 'rules' ? "Add Rules" : "Add Meeting Points"
    const [loadingImages, setLoadingImages] = useState({});
    const [emailInputs, setEmailInputs] = useState([{ id: Math.random().toString(), value: '' }]);
    const finalCategory = data?.type === 'event_duplicate' ? eventCategories : categories?.category

    const selectAsset = (id) => {
        const asset = assets?.find(item => item.id === id);
        setSelectedAsset(asset);
    };

    const togglePrivateSwitch = () => {
        setEventPrivate((previousState) => {
            const newState = !previousState;

            if (newState) {
                invitationSheet?.current?.open();
            } else {
                invitationSheet?.current?.close();
            }

            return newState;
        });
    };
    const togglePaidSwitch = () => { setPaidEvent(previousState => !previousState) };

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


    const handleImageLoadStart = (index) => {
        setLoadingImages(prevState => ({ ...prevState, [index]: true }));
    };

    const handleImageLoadEnd = (index) => {
        setLoadingImages(prevState => ({ ...prevState, [index]: false }));
    };

    const validateFields = () => {
        let valid = true;
        let newErrors = {};

        if (!name) {
            valid = false;
            newErrors.name = "Event name is required";
        }

        if (!description) {
            valid = false;
            newErrors.description = "Description is required";
        }

        // if (!eventType) {
        //     valid = false;
        //     newErrors.eventType = "Event Type is required";
        // }


        if (isPaidEvent && !eventFee) {
            valid = false;
            newErrors.eventFee = "Event fee is required for paid event";
        }

        if (!distance) {
            valid = false;
            newErrors.distance = "Distance is required";
        }

        setErrors(newErrors);
        return valid;
    };

    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.MAIN_DASHBOARD, { screen: SCREENS.EVENTS })
        dispatch(resetData())
        return true;
    }

    useBackHandler(handleBackPress)


    useEffect(() => {
        if (data?.type === 'event_duplicate') {
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
                    setActivityList(eventData?.activities)
                    setEventPrivate(eventData?.is_public ? false : true)
                    setPaidEvent(eventData?.is_paid)
                    setEventFee(eventData?.amount)
                    setDistance(eventData?.distance)
                    const location = { latitude: eventData?.latitude, longitude: eventData?.longitude, location_name: eventData?.location }
                    setEventLocation(location)
                    setEventCategories(eventData?.categories)
                    const meetingPoints = eventData?.meeting_points?.map(point => point.description);
                    setGoalsItem(meetingPoints || [])


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
        if (data?.type !== 'event_duplicate') {
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
                    dispatch(getAllClubs({ page: 1, limit: 100, searchPayload: {} })),
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

        const mediaImagesData = mediaImages?.map((image, index) => ({
            url: image?.secure_url,
            public_id: image?.public_id
        }));

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
            event_type: "Annual",
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
            method: "POST",
            data: dataPayload
        }

        dispatch(createEvent(payload)).then((result) => {
            if (result?.payload?.success === true) {
                setEventId(result?.payload?.result?.id)
                handleSendInvitations(result?.payload?.result?.id)
                showAlert("Success", "success", result?.payload?.message)
                const timer = setTimeout(() => {
                    setCurrentStep(prevStep => prevStep + 1);
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
                        setGoalsItem([...goalsItem, text]);
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
                        setGoalsItem([...goalsItem, text]);
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

    const removeItem = (index) => {
        const newItems = goalsItem?.filter((_, i) => i !== index);
        setGoalsItem(newItems);
    };

    const removeBadges = (item, index) => {

        const payload = {
            badgeId: item?.id,
            method: "DELETE"
        }
        dispatch(createDeleteBadge(payload)).then((result) => {
            if (result?.payload.success === true) {
                showAlert("Success", "success", result?.payload?.message)
                const newItems = addedBadges?.filter((_, i) => i !== index);
                setAddedBadges(newItems);
            } else if (result?.payload.success === false) {
                showAlert("Error", "error", result?.payload?.message)
            }
        })
    };

    const removeActivity = (item, index) => {
        const finalPayload = {
            activityId: item?.id,
            method: 'DELETE'
        }

        dispatch(addEventActivity(finalPayload)).then((result) => {
            if (result?.payload.success === true) {
                showAlert("Success", "success", result?.payload?.message);
                const newItems = activityList?.filter((_, i) => i !== index);
                setActivityList(newItems);
            } else if (result?.payload.success === false) {
                showAlert("Error", "error", result?.payload?.message);
            }
        });

    };

    const removeRulesItem = (index) => {
        const newItems = clubRules?.filter((_, i) => i !== index);
        setClubRules(newItems);
    };

    const removeScheduleItem = (index) => {
        const newItems = scheduleList?.filter((_, i) => i !== index);
        setScheduleList(newItems);
    };

    const resetScheduleForm = () => {
        scheduleSheetRef?.current.close()
        setEmails([{ id: 1, email: '' }]);
        setScheduleName('')
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
    };


    const handleSendInvitations = async (eventId) => {

        let successCount = 0;

        for (let i = 0; i < selectedItems?.length; i++) {
            const payload = {
                event_id: eventId,
                user_id: selectedItems[i].user_id,
                // email: scheduleList[i].email
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
                // user_id: scheduleList[i].value,
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



    const handleNextStep = () => {
        if (currentStep === 0 && !validateFields()) {
            return
        }
        if (currentStep === 0 && !eventLocation) {
            showAlert("Error", "error", "Select event location")
            return
        }
        if (currentStep === 3) {
            handleEventCreate();
            return
        }
        // if (currentStep === 3) {
        //     handleEventCreate();
        //     return
        // }
        if (currentStep === 1 && selectedRoutes?.length === 0) {
            showAlert("Error", "error", "Select Route from added list.")
            return
        }

        if (currentStep === 0 && mediaImages?.length === 0) {
            showAlert("Error", "error", "Add at least one Image.")
            return
        }

        // if (!isPrivateEvent && currentStep === 4) {
        //     handleBackPress();
        //     return
        // }

        if (currentStep == 6) {
            handleBackPress();
            return
        }

        // if (!isPrivateEvent && currentStep == 6) {
        //     handleBackPress();
        //     return
        // }

        // if (currentStep == 7) {
        //     handleSendInvitations()
        //     return
        // }
        // if (!isPrivateEvent && currentStep === 5) {
        //     return
        // }
        setCurrentStep(prevStep => prevStep + 1);

    };

    const handlePreviousStep = () => {
        if (currentStep === 0) {
            handleBackPress();
            return
        }

        if (currentStep > 3 && currentStep == 4) {
            handleBackPress();
            return
        }
        setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
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

    const handleRemoveEmail = (id, email) => {
        // Remove email from scheduleList if it exists
        const updatedScheduleList = scheduleList.filter(item => item.email !== email);
        setScheduleList(updatedScheduleList);

        // Remove the email input
        const filteredEmails = emails.filter(emailField => emailField.id !== id);
        setEmails(filteredEmails.length > 0 ? filteredEmails : [{ id: emails.length + 1, email: '' }]);
    };

    const createScheduleSection = () => {
        return (
            <View>
                <TouchableOpacity onPress={() => { handlePreviousStep() }} style={styles.backButton}>
                    <BackButton width={scaleWidth(40)} height={scaleHeight(40)} />
                </TouchableOpacity>
                <Text style={styles.heading}>
                    Send Invitations
                </Text>

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

                <TouchableOpacity onPress={addEmailInput} style={{ position: 'absolute', right: 0, top: scaleHeight(153) }}>
                    <Icon name="add-circle-outline" size={28} color={theme.colors.textHeading} />
                </TouchableOpacity>

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
                        // const modifyInvitation = { ...invitationData, email: scheduleName }
                        const modifyInvitation = emails.flatMap(emailField => [
                            { label: invitationData?.label, value: invitationData?.value }, // Get label and value from invitationData
                            { email: emailField.email }  // Get email from emailField
                        ]);

                        // const modifyInvitation = emails.flatMap(emailField => {
                        //     const { label, value } = invitationData;

                        //     // Create an array to hold the result
                        //     const result = [];

                        //     // Include the { label, value } object only if both are defined
                        //     if (label !== undefined && value !== undefined) {
                        //         result.push({ label, value });
                        //     }

                        //     // Always include the { email } object
                        //     result.push({ email: emailField.email });

                        //     return result;
                        // });

                        setScheduleList(modifyInvitation);
                        // const modifyInvitation = emails.map(emailField => ({
                        //     ...invitationData, email: emailField.email
                        // }));
                        // setScheduleList(modifyInvitation);
                        //setScheduleList([...scheduleList, modifyInvitation]);
                        resetScheduleForm();
                    }}
                    title={"Add Member"}
                    customStyle={{ width: '100%', marginTop: '30%' }}
                />
            </View>
        );
    }

    const createScheduleSec = () => {

        return (
            <View>

                <Text style={styles.heading}>
                    Send Invitation
                </Text>

                <View style={{ marginTop: 20 }}>

                    {
                        scheduleList?.map((item, index) => {
                            return <View key={index}>
                                <GoalsItem
                                    item={item?.label}
                                    onRemove={() => removeScheduleItem(index)}
                                />
                            </View>
                        })
                    }

                    <RBSheet
                        ref={scheduleSheetRef}
                        height={height}
                        openDuration={250}
                        customStyles={{ container: styles.scheduleSheet }}
                        closeOnPressBack={true}
                    >

                        {createScheduleSection()}

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
                    />

                </View>


            </View>
        )

    }


    const moreAboutEventSection = () => {

        return (
            <View style={styles.sectionContainer}>

                <Text style={styles.heading}>
                    More About Event
                </Text>

                <Text style={[styles.heading, { fontSize: normalizeFontSize(14), color: theme.colors.lightGrey, width: '90%' }]}>
                    Before we move next we need to have more info about Event.
                </Text>

            </View>
        )

    }

    const createEventSection = () => {

        return (
            <CustomLayout>
                <View style={styles.sectionContainer}>
                    <Text style={styles.heading}>
                        Create Event
                    </Text>

                    {addMediaSection()}
                    {!data?.clubId && <>
                        <Text style={styles.label}>{"Select Club"}</Text>

                        <TouchableOpacity onPress={() => {
                            clubSheet.current?.open()

                        }} style={styles.placeholderButton2}>
                            <Text style={styles.placeholderText2}>
                                {clubName ? clubName : ''}
                            </Text>
                            <AntDesign name="down" size={18} color={theme.colors.labelColors} />
                        </TouchableOpacity>

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
                    {
                        role === "ADMIN" && <>
                            <CustomTextInput
                                label={"Event Type"}
                                identifier={'event_type'}
                                placeholder={'Annual/Compitition'}
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
                            />
                            {errors.eventType && role === "ADMIN" && <Text style={styles.errorText}>{errors.eventType}</Text>}</>}

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

                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.label}>{"Add Location"}</Text>
                        <TouchableOpacity onPress={() => addLocationSheet?.current?.open()} style={styles.placeholderButton}>
                            <Text style={styles.placeholderText}>
                                {eventLocation?.location_name}
                            </Text>
                        </TouchableOpacity>
                    </View>

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
        )

    }

    const renderRouteView = () => {

        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => { routeSheetRef?.current?.close() }} style={styles.backButton}>
                    <BackButton width={scaleWidth(40)} height={scaleHeight(40)} />
                </TouchableOpacity>
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
                    Add Routes
                </Text>


                <View style={{ marginTop: 20 }}>


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

    const addGoalsSection = () => {

        return (
            <View>
                {/* <Image style={styles.image} source={addGoalsImg} /> */}
                <Text style={styles.heading}>
                    Add Meeting Points
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
                        goalsItem?.map((item, index) => {
                            return <View key={index}>
                                <GoalsItem
                                    item={item}
                                    onRemove={() => removeItem(index)}
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
                        title={"Add"}
                        customStyle={styles.addGoalStyle}
                        textCustomStyle={{
                            color: '#888888',
                        }}
                    />

                </View>


            </View>
        )

    }

    const renderBadgesList = () => {

        return <RBSheet
            ref={badgesListSheet}
            height={700}
            openDuration={250}
            customStyles={{ container: styles.scheduleSheet }}
            closeOnPressBack={true}
        >

            <TouchableOpacity
                style={{
                    alignSelf: 'flex-end',

                }}
                onPress={() => {
                    badgesListSheet?.current?.close()
                }}>
                <CloseIcon width={24} height={24} />

            </TouchableOpacity>

            <FlatList
                data={assets}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {

                            if (item?.type === 'cash') {
                                setBadgeType('PRIZE')
                            } else {
                                setBadgeType('DIGITAL')
                            }
                            badgesListSheet?.current?.close()
                            selectAsset(item.id)
                        }}
                        style={styles.itemContainer}>
                        <item.SvgComponent width={120} height={120} />
                    </TouchableOpacity>
                )}
                numColumns={3}
                contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: scaleHeight(30)
                }}
                keyExtractor={(item) => item.id}
            />

        </RBSheet>

    }

    const handleCreateBadge = (isAddMore = false) => {
        const dataPayload = {
            badge_type: badgeType,
            badge_title: badgeTitle,
            badge_icon: {
                url: selectedAsset?.id,
                public_id: "badge_icon_public_id"
            }
        }
        const payload = {
            data: dataPayload,
            method: "POST"
        }
        dispatch(createDeleteBadge(payload)).then((result) => {
            if (result?.payload.success === true) {
                setAddedBadges([...addedBadges, result?.payload?.result])
                showAlert("Success", "success", result?.payload?.message)
                if (!isAddMore) {
                    addBadgesSheet?.current?.close();
                }
                setBadgeTitle('');
                setBadgeType('')
                setSelectedAsset(null)
            } else if (result?.payload.success === false) {
                showAlert("Error", "error", result?.payload?.message)
            }
        })
    }

    const addBadgeSection = () => {

        return (
            <View>
                {/* <Image style={styles.image} source={addGoalsImg} /> */}
                <Text style={styles.heading}>
                    Add Badges
                </Text>

                <View style={{ marginTop: 20 }}>
                    {
                        addedBadges?.map((item, index) => {
                            return <View key={index}>
                                <AddedBadges
                                    item={item}
                                    onRemove={() => removeBadges(item, index)}
                                />
                            </View>
                        })
                    }


                    <RBSheet
                        ref={addBadgesSheet}
                        height={700}
                        openDuration={250}
                        customStyles={{ container: styles.scheduleSheet }}
                        closeOnPressBack={true}
                    >

                        <View style={{
                            flexDirection: 'row'
                        }}>

                            <Text style={[{
                                fontSize: normalizeFontSize(14), flex: 1,
                                fontFamily: fonts.fontsType.bold,
                                color: theme.colors.textHeading,
                            }]}>
                                Add Badge
                            </Text>

                            <TouchableOpacity
                                style={{
                                    alignSelf: 'flex-end',

                                }}
                                onPress={() => {
                                    addBadgesSheet?.current?.close()
                                }}>
                                <CloseIcon width={24} height={24} />
                            </TouchableOpacity>

                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 100, flex: 1 }}>
                            {selectedAsset != null && <selectedAsset.SvgComponent width={120} height={120} />}
                            <Button
                                onPress={() => {
                                    badgesListSheet?.current?.open()
                                }}
                                title={"Add Badge"}
                                customStyle={[styles.addGoalStyle, { height: '50%', width: '35%', marginBottom: 0, marginTop: -50, marginHorizontal: 10 }]}
                                textCustomStyle={{
                                    color: '#888888',
                                    fontSize: normalizeFontSize(12)
                                }}
                            />
                        </View>

                        <View>
                            <CustomTextInput
                                label={"Badge Type"}
                                identifier={'badge_type'}
                                value={badgeType}
                                onValueChange={setBadgeType}
                                mainContainer={{ marginTop: scaleHeight(0) }}
                                autoCapitalize={'sentences'}
                                isEditable={false}
                            />

                            <CustomTextInput
                                label={"Badge Title"}
                                identifier={'badge_title'}
                                placeholder={'Top Performer'}
                                value={badgeTitle}
                                onValueChange={setBadgeTitle}
                                mainContainer={{ marginTop: scaleHeight(20) }}
                                autoCapitalize={'sentences'}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

                            <Button
                                onPress={() => {
                                    handleCreateBadge(true)
                                }}
                                title={"Add More"}
                                customStyle={{ width: '40%', marginTop: '30%', backgroundColor: theme.colors.textHeading }}
                                textCustomStyle={{ color: theme.colors.black }}
                            />
                            <Button
                                loading={badgeLoader}
                                onPress={() => {
                                    handleCreateBadge()
                                }}
                                title={"Add"}
                                customStyle={{ width: '40%', marginTop: '30%' }}
                            />

                        </View>


                        {renderBadgesList()}

                    </RBSheet>

                    <Button
                        onPress={() => {
                            addBadgesSheet?.current?.open()
                        }}
                        title={"Add"}
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
            <TouchableOpacity onPress={() => locationSheetRef?.current?.open()} style={styles.placeholderButton}>
                <Text style={styles.placeholderText}>
                    {activityLocation?.location_name}
                </Text>
            </TouchableOpacity>


            <RBSheet
                ref={locationSheetRef}
                height={600}
                openDuration={250}
                customStyles={{ container: styles.scheduleSheet }}
                closeOnPressBack={true}
            >


                <View style={{
                    flexDirection: 'row'
                }}>

                    <Text style={[styles.heading, { fontSize: normalizeFontSize(14), flex: 1 }]}>
                        Add Activity Location
                    </Text>

                    <TouchableOpacity
                        style={{
                            alignSelf: 'flex-end',

                        }}
                        onPress={() => {
                            locationSheetRef?.current?.close()
                        }}>
                        <CloseIcon width={24} height={24} />
                    </TouchableOpacity>

                </View>


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
                    Add Event Activities
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
            <View>

                <Text style={[styles.heading, { width: '55%' }]}>
                    Select the relevant categories
                </Text>
                <View style={{ marginTop: 30 }}>
                    <InterestList
                        interests={finalCategory}
                        //interests={categories?.subCategory}
                        onSelectionChange={handleSelectionChange} />
                </View>
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
            marginTop: 30
        }}>
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

                onPress={() => {
                    addLocationSheet?.current?.close()
                }}
                title={"Add Location"}
                customStyle={{ width: '100%', marginBottom: 10 }}
            />
        </View>
    }

    const renderAddLocationSheet = () => {

        return <RBSheet
            ref={addLocationSheet}
            height={600}
            openDuration={500}
            customStyles={{
                wrapper: styles.wrapper,
                container: [styles.sheetContainer,
                { backgroundColor: theme.colors.primary }]
            }}
        >

            <View style={{
                flex: 1,
                padding: 20
            }}>
                <View style={{
                    flexDirection: 'row'
                }}>

                    <Text style={[styles.heading, { fontSize: normalizeFontSize(14), flex: 1 }]}>
                        Add Event Location
                    </Text>

                    <TouchableOpacity
                        style={{
                            alignSelf: 'flex-end',

                        }}
                        onPress={() => {
                            addLocationSheet?.current?.close()
                        }}>
                        <CloseIcon width={24} height={24} />
                    </TouchableOpacity>

                </View>
                {renderAddLocation()}
            </View>

        </RBSheet>

    }

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    createEventSection()
                );
            case 1:
                return (
                    addRoutes()
                );

            case 2:
                return (
                    addBadgeSection()
                );

            case 3:
                return (
                    selectInterestsSection()
                );
            case 4:
                return (
                    moreAboutEventSection()
                    //selectInterestsSection()
                );

            case 5:
                return (
                    addGoalsSection()

                );
            case 6:
                return (
                    addEventActivitySection()
                );
            // case 7:
            //     return (
            //         createScheduleSec()
            //     );
            default:
                return null;
        }
    };


    const showLoader = () => {
        return <FullScreenLoader
            loading={duplicateEventLoader} />;
    };

    const handleClubPress = (item) => {
        setSelectedClubId(item?.id)
        setClubName(item?.name)
        clubSheet?.current?.close();
    };


    const handleClubMemberPress = (item) => {
        console.log('Item pressed:', item);
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


    return (
        <SafeAreaView style={styles.container}>
            {
                duplicateEventLoader ? showLoader() : <>
                    {<TouchableOpacity onPress={() => { handlePreviousStep() }} style={styles.backButton}>
                        <BackButton width={scaleWidth(40)} height={scaleHeight(40)} />
                    </TouchableOpacity>}
                    <View style={{
                        flex: 1
                    }}>
                        {renderStep()}
                    </View>
                    <Button
                        loading={loading || invitationLoader}
                        onPress={handleNextStep}
                        title={buttonTitle}
                        customStyle={{ marginBottom: 10 }}
                    />
                    {renderBottomSheet()}
                    {renderAddLocationSheet()}
                </>
            }

            {/* Clubs sheet */}
            <CustomSheet
                ref={clubSheet}
                isHeader={true}
                title={'Select Club'}
                height={600}
            >
                <FlatList
                    data={filteredClubs}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ClubItems
                            item={item}
                            onPress={handleClubPress}
                        />
                    )}
                />
            </CustomSheet>

            {/* Add members sheet */}

            <CustomSheet
                ref={invitationSheet}
                isHeader={true}
                title={'Add Members'}
                height={700}
            >
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
                            data={uniqueClubMembers} // Data passed from props
                            keyExtractor={(item) => item.id.toString()} // Use item id as the key
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

                <Button
                    onPress={() => {
                        invitationSheet?.current?.close();
                    }}
                    customStyle={{
                        width: '70%',
                    }}
                    title={'Add Members'}
                />

            </CustomSheet>

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
        marginTop: scaleHeight(20),
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
    itemContainer: {
        alignItems: 'center',
        marginBottom: 20,


    },
    placeholderButton2: {
        backgroundColor: theme.colors.inputBg,
        borderRadius: 30,
        height: 45,
        justifyContent: 'center',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    placeholderText2: {
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
        fontFamily: fonts.fontsType.medium,
        flex: 1
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


export default EventCreation;
