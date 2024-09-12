// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    invitiesList: [],
    loading: false,
    error: null,
};

export const getInvitiesList = createAsyncThunk(
    'getInvitiesList/getInvitiesList',
    async (eventId, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('GET', `/events/invites/${eventId}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getClubDetailSlice = createSlice({
    name: 'getInvitiesList',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getInvitiesList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getInvitiesList.fulfilled, (state, action) => {
                state.loading = false;
                state.invitiesList = action.payload.result?.event_initiations;
            })
            .addCase(getInvitiesList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getClubDetailSlice.reducer;
