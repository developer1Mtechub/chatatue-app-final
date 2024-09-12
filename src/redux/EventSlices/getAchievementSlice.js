// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    achievementDetail: null,
    loading: false,
    error: null,
};

export const getAchievement = createAsyncThunk(
    'getAchievement/getAchievement',
    async (achievementId, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('GET', `${ENDPOINTS.GET_ACHIEVEMENT}${achievementId}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getClubDetailSlice = createSlice({
    name: 'getAchievement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAchievement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAchievement.fulfilled, (state, action) => {
                state.loading = false;
                state.achievementDetail = action.payload.result;
            })
            .addCase(getAchievement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getClubDetailSlice.reducer;
