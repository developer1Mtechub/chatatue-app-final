import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from '../constant/constants';
import BottomTabNavigator from './BottomTabBar';
import { ClubCreation, ClubDetail, ClubFeeds, ClubPostCreation, ClubPostDetail, ClubRequests, EventActivities, EventCreation, EventDetail, EventPerformance, HighlightDetail, JoinedClub, ManageEventParticipants, ManageMembers, Route, Schedule, TrackingRoute, UpdateClub, UpdateEvent, UserPerformance, ViewProfile } from '..'

const Stack = createStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name={SCREENS.MAIN_DASHBOARD} component={BottomTabNavigator} />
            <Stack.Screen name={SCREENS.CLUB_CREATION} component={ClubCreation} />
            <Stack.Screen name={SCREENS.CLUB_DETAIL} component={ClubDetail} />
            <Stack.Screen name={SCREENS.UPDATE_CLUB} component={UpdateClub} />
            <Stack.Screen name={SCREENS.MANAGE_MEMBERS} component={ManageMembers} />
            <Stack.Screen name={SCREENS.CLUB_REQUESTS} component={ClubRequests} />
            <Stack.Screen name={SCREENS.VIEW_PROFILE} component={ViewProfile} />
            <Stack.Screen name={SCREENS.CLUB_FEEDS} component={ClubFeeds} />
            <Stack.Screen name={SCREENS.CLUB_POST_CREATION} component={ClubPostCreation} />
            <Stack.Screen name={SCREENS.HIGHLIGHT_CLUB_DETAIL} component={HighlightDetail} />
            <Stack.Screen name={SCREENS.CLUB_POST_DETAIL} component={ClubPostDetail} />
            <Stack.Screen name={SCREENS.EVENT_CREATION} component={EventCreation} />
            <Stack.Screen name={SCREENS.EVENT_DETAIL} component={EventDetail} />
            <Stack.Screen name={SCREENS.UPDATE_EVENT} component={UpdateEvent} />
            <Stack.Screen name={SCREENS.JOINED_CLUB} component={JoinedClub} />
            <Stack.Screen name={SCREENS.MANAGE_PARTICIPANTS} component={ManageEventParticipants} />
            <Stack.Screen name={SCREENS.SCHEDULE} component={Schedule} />
            <Stack.Screen name={SCREENS.ROUTE} component={Route} />
            <Stack.Screen name={SCREENS.TRACKING_ROUTE} component={TrackingRoute} />
            <Stack.Screen name={SCREENS.USER_PERFORMANCE} component={UserPerformance} />
            <Stack.Screen name={SCREENS.EVENT_PERFORMANCE} component={EventPerformance} />
            <Stack.Screen name={SCREENS.EVENT_ACTIVITIES} component={EventActivities} />
        </Stack.Navigator>
    );
};

export default MainStack;
