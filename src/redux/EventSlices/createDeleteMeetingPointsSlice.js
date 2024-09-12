import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const createDeleteMeetingPoints = createAsyncThunk(
    'createDeleteMeetingPoints/createDeleteMeetingPoints',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const finalEndpoint = payload?.method === 'DELETE' ? `${ENDPOINTS.DELETE_MEETING_POINTS}${payload?.meetingID}` : ENDPOINTS.CREATE_MEETING_POINTS
            const data = await makeRequest(payload?.method, finalEndpoint, payload?.data, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const createDeleteMeetingPointsSlice = createSlice({
    name: 'createDeleteMeetingPoints',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createDeleteMeetingPoints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDeleteMeetingPoints.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(createDeleteMeetingPoints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default createDeleteMeetingPointsSlice.reducer;
