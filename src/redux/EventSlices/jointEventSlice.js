import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const joinEvent = createAsyncThunk(
    'joinEvent/joinEvent',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('POST', `/events/${payload?.eventId}/join/${payload?.userId}`, payload, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const joinEventSlice = createSlice({
    name: 'joinEvent',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(joinEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(joinEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default joinEventSlice.reducer;
