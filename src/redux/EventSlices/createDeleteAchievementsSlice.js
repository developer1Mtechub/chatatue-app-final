import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const createDeleteAchievements = createAsyncThunk(
    'createDeleteAchievements/createDeleteAchievements',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const finalEndpoint = payload?.method === 'DELETE' ? `${ENDPOINTS.DELETE_ACHIEVEMENT}${payload?.meetingID}` : ENDPOINTS.CREATE_ACHIEVEMENT
            const data = await makeRequest(payload?.method, finalEndpoint, payload?.data, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const createDeleteAchievementsSlice = createSlice({
    name: 'createDeleteAchievements',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createDeleteAchievements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDeleteAchievements.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(createDeleteAchievements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default createDeleteAchievementsSlice.reducer;
