// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    reviews: [],
    loading: false,
    error: null,
};

export const getReviews = createAsyncThunk(
    'getReviews/getReviews',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const finalPayload = payload?.type === "EVENT" ? `type=${payload?.type}&event_id=${payload?.event_id}` : `type=${payload?.type}&user_id=${payload?.userId}`
            const data = await makeRequest('GET', `${ENDPOINTS.GET_REVIEWS}${finalPayload}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getReviewsSlice = createSlice({
    name: 'getReviews',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.result?.reviews;
            })
            .addCase(getReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getReviewsSlice.reducer;
