import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import base64 from 'base-64';

// Cloudinary configuration (store these in a .env file for security)
const cloudName = 'dlifdwxou';
const apiKey = '737415776825168';
const apiSecret = 'ZGuXZQCWlwTlSZM1144MyzlSFEI';
const uploadPreset = 'mtechub_chatatue_preset';  // Optional

// Async action to upload an image to Cloudinary
export const uploadImage = createAsyncThunk(
  'cloudinary/uploadImage',
  async (imageUri, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',  // or other file types if needed
        name: 'upload.jpg',
      });
      formData.append('upload_preset', uploadPreset);
      formData.append('api_key', apiKey);
      const timestamp = Math.round((new Date()).getTime() / 1000);
      formData.append('timestamp', timestamp.toString());

      // Make the request to Cloudinary
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data; // Will contain image URL and public_id
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async action to delete an image from Cloudinary
export const deleteImage = createAsyncThunk(
  'cloudinary/deleteImage',
  async (publicId, { rejectWithValue }) => {
    try {
      const timestamp = Math.round((new Date()).getTime() / 1000);
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = CryptoJS.SHA1(signatureString).toString(CryptoJS.enc.Hex);

      // Make the request to Cloudinary
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        public_id: publicId,
        api_key: apiKey,
        timestamp: timestamp,
        signature: signature,
      });

      if (response.data.result === 'ok') {
        return publicId;
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const fetchImages = createAsyncThunk(
  'cloudinary/fetchImages',
  async (_, { rejectWithValue }) => {
    try {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?folder=chatatueBadges&max_results=70`;

      const { status, data } = await axios.get(url, {
        headers: {
          Authorization: `Basic ${base64.encode(`${apiKey}:${apiSecret}`)}`
        }
      });

      if (status === 200) {
        return data.resources
          .filter(({ format }) => format === 'svg')
          .map(({ public_id, secure_url }) => ({ public_id, url: secure_url }));
      }

      throw new Error('Failed to fetch resources');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// Redux slice
const cloudinarySlice = createSlice({
  name: 'cloudinary',
  initialState: {
    images: [],
    svgResources: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {

    // fetch svg resources

    builder.addCase(fetchImages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchImages.fulfilled, (state, action) => {
      state.loading = false;
      state.svgResources = action.payload;
    });
    builder.addCase(fetchImages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Upload image cases
    builder.addCase(uploadImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadImage.fulfilled, (state, action) => {
      state.loading = false;
      state.images.push(action.payload); // Add new image to state
    });
    builder.addCase(uploadImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });


    // Delete image cases
    builder.addCase(deleteImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteImage.fulfilled, (state, action) => {
      state.loading = false;
      // Remove the deleted image from state
      state.images = state.images.filter((image) => image.public_id !== action.payload);
    });
    builder.addCase(deleteImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default cloudinarySlice.reducer;
