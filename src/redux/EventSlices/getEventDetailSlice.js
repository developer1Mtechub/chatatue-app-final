// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    eventDetail: null,
    loading: false,
    error: null,
};

export const getEventDetail = createAsyncThunk(
    'getEventDetail/getEventDetail',
    async (eventId, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('GET', `/events/${eventId}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getClubDetailSlice = createSlice({
    name: 'getEventDetail',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getEventDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getEventDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.eventDetail = action.payload.result;
            })
            .addCase(getEventDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getClubDetailSlice.reducer;
