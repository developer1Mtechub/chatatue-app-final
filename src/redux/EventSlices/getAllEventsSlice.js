import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';

const initialState = {
    events: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const getAllEvents = createAsyncThunk(
    'getAllEvents/getAllEvents',
    async ({ page = 1, limit = 10, searchPayload }, { getState, rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: "created_at",
                sortOrder: "DESC"
            });

            if (searchPayload?.search) params.append('search', searchPayload.search);
            if (searchPayload?.userId) params.append('user_id', searchPayload.userId);
            if (searchPayload?.creator_id) params.append('creator_id', searchPayload.creator_id);
            if (searchPayload?.club_id) params.append('club_id', searchPayload.club_id);

            const apiUrl = `/events?${params.toString()}`;
            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            // Reject the error with a proper message
            return rejectWithValue(error.response?.data || 'Failed to fetch events');
        }
    }
);

const getAllEventsSlice = createSlice({
    name: 'getAllEvents',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllEvents.fulfilled, (state, action) => {
                state.loading = false;
                const { result } = action.payload;
                const { page } = action.meta.arg;

                if (page === 1) {
                    state.events = result?.events || [];
                } else {
                    state.events = [...state.events, ...(result?.events || [])];
                }

                state.currentPage = page;
                state.totalPages = result?.pagination?.totalPages || state.totalPages;
                state.totalCount = result?.pagination?.totalItems || state.totalCount;
            })
            .addCase(getAllEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export default getAllEventsSlice.reducer;
