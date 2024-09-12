import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import makeRequest from '../../configs/makeRequest';
import { ENDPOINTS } from '../../constant/endpoints';


const initialState = {
    response: null,
    loading: false,
    error: null,
};

export const sendInvitation = createAsyncThunk(
    'sendInvitation/sendInvitation',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const data = await makeRequest('POST', ENDPOINTS.SEND_INVITATION, payload, null, null);
            return data;
        } catch (error) {
            return error
        }
    }
);

const sendInvitationSlice = createSlice({
    name: 'sendInvitation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(sendInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendInvitation.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload?.result;
            })
            .addCase(sendInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default sendInvitationSlice.reducer;
