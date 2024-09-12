import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';

const initialState = {
    activities: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const getAllEventActivities = createAsyncThunk(
    'getAllEventActivities/getAllEventActivities',
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
            if (searchPayload?.creator_id) params.append('creator_id', searchPayload.creator_id);

            const apiUrl = `/event-activities?${params.toString()}`;
            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            // Reject the error with a proper message
            return rejectWithValue(error.response?.data || 'Failed to fetch events');
        }
    }
);

const getAllEventActivitiesSlice = createSlice({
    name: 'getAllEventActivities',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllEventActivities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllEventActivities.fulfilled, (state, action) => {
                state.loading = false;
                const { result } = action.payload;
                const { page } = action.meta.arg;

                if (page === 1) {
                    state.activities = result?.activities || [];
                } else {
                    state.activities = [...state.activities, ...(result?.activities || [])];
                }

                state.currentPage = page;
                state.totalPages = result?.pagination?.totalPages || state.totalPages;
                state.totalCount = result?.pagination?.totalItems || state.totalCount;
            })
            .addCase(getAllEventActivities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export default getAllEventActivitiesSlice.reducer;
