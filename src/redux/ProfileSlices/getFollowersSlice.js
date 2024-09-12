// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    followers: [],
    loading: false,
    error: null,
};

export const getFollowers = createAsyncThunk(
    'getFollowers/getFollowers',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('GET', `${ENDPOINTS.GET_FOLLOWERS}type=followers&userId=${payload?.userId}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getFollowersSlice = createSlice({
    name: 'getFollowers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getFollowers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFollowers.fulfilled, (state, action) => {
                state.loading = false;
                state.followers = action.payload.result?.followType;
            })
            .addCase(getFollowers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getFollowersSlice.reducer;
