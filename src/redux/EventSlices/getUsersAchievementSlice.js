import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';

const initialState = {
    achievements: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const getUsersAchievements = createAsyncThunk(
    'getUsersAchievements/getUsersAchievements',
    async ({ page = 1, limit = 10, searchPayload }, { getState, rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: "created_at",
                sortOrder: "DESC"
            });

            if (searchPayload?.search) params.append('search', searchPayload.search);
            if (searchPayload?.event_id) params.append('event_id', searchPayload.event_id);
            if (searchPayload?.user_id) params.append('user_id', searchPayload.user_id);

            const apiUrl = `/achievements?${params.toString()}`;
            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            // Reject the error with a proper message
            return rejectWithValue(error.response?.data || 'Failed to fetch achievement');
        }
    }
);

const getUsersAchievementsSlice = createSlice({
    name: 'getUsersAchievements',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUsersAchievements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsersAchievements.fulfilled, (state, action) => {
                state.loading = false;
                const { result } = action.payload;
                const { page } = action.meta.arg;

                if (page === 1) {
                    state.achievements = result?.achievements || [];
                } else {
                    state.achievements = [...state.achievements, ...(result?.achievements || [])];
                }

                state.currentPage = page;
                state.totalPages = result?.pagination?.totalPages || state.totalPages;
                state.totalCount = result?.pagination?.totalItems || state.totalCount;
            })
            .addCase(getUsersAchievements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export default getUsersAchievementsSlice.reducer;
