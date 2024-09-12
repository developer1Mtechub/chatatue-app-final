import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';

const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const getPolicyAndTerms = createAsyncThunk(
    'getPolicyAndTerms/getPolicyAndTerms',
    async (type, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('GET', `/policy?type=${type}`, null, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const getPolicyTermsSlice = createSlice({
    name: 'getPolicyAndTerms',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getPolicyAndTerms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPolicyAndTerms.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(getPolicyAndTerms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default getPolicyTermsSlice.reducer;
