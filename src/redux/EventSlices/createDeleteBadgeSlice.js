import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const createDeleteBadge = createAsyncThunk(
    'createDeleteBadge/createDeleteBadge',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const finalEndpoint = payload?.method === 'DELETE' ? `${ENDPOINTS.DELETE_BADGE}${payload?.badgeId}` : ENDPOINTS.CREATE_BADGE
            const data = await makeRequest(payload?.method, finalEndpoint, payload?.data, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const createDeleteBadgeSlice = createSlice({
    name: 'createDeleteBadge',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createDeleteBadge.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDeleteBadge.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(createDeleteBadge.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default createDeleteBadgeSlice.reducer;
