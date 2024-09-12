import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const addEventActivity = createAsyncThunk(
    'addEventActivity/addEventActivity',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const finalEndpoint = payload?.method === 'DELETE' ? `/event-activities/${payload?.activityId}` : ENDPOINTS.EVENT_ACTIVITY_CREATE
            const data = await makeRequest(payload?.method, finalEndpoint, payload?.data, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const addEventActivitySlice = createSlice({
    name: 'addEventActivity',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addEventActivity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addEventActivity.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(addEventActivity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default addEventActivitySlice.reducer;
