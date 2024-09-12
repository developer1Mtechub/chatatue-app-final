import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    dataPayload: null,
    currentRoute: '',
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setDataPayload: (state, action) => {
            state.dataPayload = action.payload;
        },
        setRoute: (state, action) => {
            state.currentRoute = action.payload;
        },
    },
});

export const { setDataPayload, setRoute } = appSlice.actions;

export default appSlice.reducer;
