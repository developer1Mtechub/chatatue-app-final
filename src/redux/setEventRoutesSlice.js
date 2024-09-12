import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    eventRoutes: [],
    trackingRoute: []
};

const setEventRoutesSlice = createSlice({
    name: 'eventRoutes',
    initialState,
    reducers: {
        setRoutes: (state, action) => {
            state.eventRoutes = action.payload;
        },
        setTrackingRoute: (state, action) => {
            state.trackingRoute = action.payload;
        },
        resetRoutes: (state, action) => {
            state.eventRoutes = [];
        },
    },
});

export const { setRoutes, resetRoutes, setTrackingRoute } = setEventRoutesSlice.actions;

export default setEventRoutesSlice.reducer;
