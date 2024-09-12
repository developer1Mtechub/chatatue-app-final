import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const deleteEvent = createAsyncThunk(
    'deleteEvent/deleteEvent',
    async (eventId, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('DELETE', `/events/${eventId}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const deleteClubSlice = createSlice({
    name: 'deleteEvent',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(deleteEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default deleteClubSlice.reducer;
