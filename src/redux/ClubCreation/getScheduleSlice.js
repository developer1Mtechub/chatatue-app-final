// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';


const initialState = {
    schedules: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const getSchedule = createAsyncThunk(
    'getSchedule/getSchedule',
    async ({ page = 1, limit = 50, payload }, { getState, rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: "created_at",
                sortOrder: "DESC"
            });


            const apiUrl = `/schedule?club_id=${payload?.clubId}&page=1&limit=50`;
            console.log('apiUrl', apiUrl)

            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getScheduleSlice = createSlice({
    name: 'getSchedule',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSchedule.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.page === 1) {
                    state.schedules = action.payload.result?.schedules;
                } else {
                    state.schedules = [...state.schedules, ...action.payload.result?.schedules];
                }
                state.currentPage = action.meta.arg.page;
                state.totalPages = action.payload.result?.pagination?.totalPages;
                state.totalCount = action.payload.result?.pagination?.totalItems;
            })
            .addCase(getSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});


export default getScheduleSlice.reducer;
