import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';

const initialState = {
    contacts: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
};

export const getUserContacts = createAsyncThunk(
    'getUserContacts/getUserContacts',
    async ({ page = 1, limit = 10 }, { getState, rejectWithValue }) => {
        try {
            const { user_id } = getState().auth
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortField: "created_at",
                sortOrder: "DESC"
            });

            const apiUrl = `/contact-suggestions/${user_id}?${params.toString()}`;
            const data = await makeRequest('GET', apiUrl, null, null, null);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch contacts');
        }
    }
);

const getUserContactsSlice = createSlice({
    name: 'getUserContacts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserContacts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserContacts.fulfilled, (state, action) => {
                state.loading = false;
                const { result } = action.payload;
                const { page } = action.meta.arg;

                if (page === 1) {
                    state.contacts = result?.contacts || [];
                } else {
                    state.contacts = [...state.contacts, ...(result?.contacts || [])];
                }

                state.currentPage = page;
                state.totalPages = result?.pagination?.totalPages || state.totalPages;
                state.totalCount = result?.pagination?.totalItems || state.totalCount;
            })
            .addCase(getUserContacts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export default getUserContactsSlice.reducer;
