// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    joinClubs: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const joinedClubs = createAsyncThunk(
    'joinedClubs/joinedClubs',
    async ({ page = 1, limit = 10, searchPayload }, { getState, rejectWithValue }) => {
        try {
            const { user_id } = getState().auth
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: "created_at",
                sortOrder: "DESC"
            });

            if (searchPayload?.search) params.append('search', searchPayload.search);
            //if (searchPayload?.user_id) params.append('user_id', searchPayload.user_id);
            //if (searchPayload?.searcher_id) params.append('searcher_id', searchPayload.searcher_id);

            const apiUrl = `/membership/join-clubs/${user_id}?${params.toString()}`;
            console.log('apiUrl', apiUrl)

            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const joinedClubsSlice = createSlice({
    name: 'joinedClubs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(joinedClubs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinedClubs.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.page === 1) {
                    state.joinClubs = action.payload.result?.clubs;
                } else {
                    state.joinClubs = [...state.joinClubs, ...action.payload.result?.clubs];
                }
                state.currentPage = action.meta.arg.page;
                state.totalPages = action.payload.result?.pagination?.totalPages;
                state.totalCount = action.payload.result?.pagination?.totalItems;
            })
            .addCase(joinedClubs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default joinedClubsSlice.reducer;
