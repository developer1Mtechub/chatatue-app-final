// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    clubRoutes: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const getRoutesByClub = createAsyncThunk(
    'getRoutesByClub/getRoutesByClub',
    async ({ page = 1, limit = 20, searchPayload }, { getState, rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: "created_at",
                sortOrder: "DESC"
            });
            if (searchPayload?.clubId) params.append('club_id', searchPayload.clubId);

            const apiUrl = `/routes?${params.toString()}`;
            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getRoutesByClubSlice = createSlice({
    name: 'getRoutesByClub',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRoutesByClub.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoutesByClub.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.page === 1) {
                    state.clubRoutes = action.payload.result?.routes;
                } else {
                    state.clubRoutes = [...state.clubRoutes, ...action.payload.result?.routes];
                }
                state.currentPage = action.meta.arg.page;
                state.totalPages = action.payload.result?.pagination?.totalPages;
                state.totalCount = action.payload.result?.pagination?.totalItems;
            })
            .addCase(getRoutesByClub.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getRoutesByClubSlice.reducer;
