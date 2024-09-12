// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    routeDetail: null,
    loading: false,
    error: null,
};

export const getRouteById = createAsyncThunk(
    'getRouteById/getRouteById',
    async (routeId, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('GET', `/routes/${routeId}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getRouteByIdSlice = createSlice({
    name: 'getRouteById',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRouteById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRouteById.fulfilled, (state, action) => {
                state.loading = false;
                state.routeDetail = action.payload.result;
            })
            .addCase(getRouteById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getRouteByIdSlice.reducer;
