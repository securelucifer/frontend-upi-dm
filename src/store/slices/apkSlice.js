import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    checkApkStatus, 
    downloadApkDirect, 
    downloadApkBlob as downloadApkBlobAPI
} from '../../services/apkAPI';



// Async thunk to fetch APK status using API function
export const fetchApkStatus = createAsyncThunk('apk/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const data = await checkApkStatus();
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

// Async thunk to download APK using API function
export const downloadApk = createAsyncThunk(
    'apk/download',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { apk } = getState();

            if (!apk.available) {
                return rejectWithValue('APK file is not available');
            }

            // Use API function for download
            const result = await downloadApkDirect();
            return result;
        } catch (error) {
            return rejectWithValue(error.message || 'Download failed');
        }
    }
);

// Async thunk to download APK via blob using API function
export const downloadApkBlob = createAsyncThunk(
    'apk/downloadBlob',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { apk } = getState();

            if (!apk.available) {
                return rejectWithValue('APK file is not available');
            }

            // Use API function for blob download
            const result = await downloadApkBlobAPI();
            return result;
        } catch (error) {
            return rejectWithValue(error.message || 'Download failed');
        }
    }
);

// Async thunk with progress tracking (additional feature)
export const downloadApkWithProgress = createAsyncThunk(
    'apk/downloadWithProgress',
    async (onProgress, { rejectWithValue, getState }) => {
        try {
            const { apk } = getState();

            if (!apk.available) {
                return rejectWithValue('APK file is not available');
            }

            // Enhanced download with progress callback
            const result = await downloadApkBlobAPI();
            
            if (onProgress && typeof onProgress === 'function') {
                // Simulate progress for direct download
                for (let i = 0; i <= 100; i += 10) {
                    setTimeout(() => onProgress(i), i * 10);
                }
            }

            return result;
        } catch (error) {
            return rejectWithValue(error.message || 'Download failed');
        }
    }
);

const initialState = {
    available: false,
    fileInfo: null,
    loading: false,
    downloading: false,
    error: null,
    downloadSuccess: false,
    downloadMessage: null,
    lastChecked: null,
    downloadProgress: 0
};

const apkSlice = createSlice({
    name: 'apk',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearDownloadStatus: (state) => {
            state.downloading = false;
            state.downloadSuccess = false;
            state.downloadMessage = null;
            state.downloadProgress = 0;
        },
        resetApkState: () => initialState,
        setDownloadProgress: (state, action) => {
            state.downloadProgress = action.payload;
        },
        updateFileInfo: (state, action) => {
            state.fileInfo = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch APK Status
            .addCase(fetchApkStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApkStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.available = action.payload.available;
                state.fileInfo = action.payload.fileInfo;
                state.lastChecked = new Date().toISOString();
            })
            .addCase(fetchApkStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Download APK Direct
            .addCase(downloadApk.pending, (state) => {
                state.downloading = true;
                state.error = null;
                state.downloadSuccess = false;
                state.downloadProgress = 0;
            })
            .addCase(downloadApk.fulfilled, (state, action) => {
                state.downloading = false;
                state.downloadSuccess = true;
                state.downloadMessage = action.payload.message;
                state.downloadProgress = 100;
            })
            .addCase(downloadApk.rejected, (state, action) => {
                state.downloading = false;
                state.error = action.payload;
                state.downloadProgress = 0;
            })

            // Download APK Blob
            .addCase(downloadApkBlob.pending, (state) => {
                state.downloading = true;
                state.error = null;
                state.downloadSuccess = false;
                state.downloadProgress = 0;
            })
            .addCase(downloadApkBlob.fulfilled, (state, action) => {
                state.downloading = false;
                state.downloadSuccess = true;
                state.downloadMessage = action.payload.message;
                state.downloadProgress = 100;
            })
            .addCase(downloadApkBlob.rejected, (state, action) => {
                state.downloading = false;
                state.error = action.payload;
                state.downloadProgress = 0;
            })

            // Download APK with Progress
            .addCase(downloadApkWithProgress.pending, (state) => {
                state.downloading = true;
                state.error = null;
                state.downloadSuccess = false;
                state.downloadProgress = 0;
            })
            .addCase(downloadApkWithProgress.fulfilled, (state, action) => {
                state.downloading = false;
                state.downloadSuccess = true;
                state.downloadMessage = action.payload.message;
                state.downloadProgress = 100;
            })
            .addCase(downloadApkWithProgress.rejected, (state, action) => {
                state.downloading = false;
                state.error = action.payload;
                state.downloadProgress = 0;
            });
    }
});

export const { 
    clearError, 
    clearDownloadStatus, 
    resetApkState, 
    setDownloadProgress,
    updateFileInfo 
} = apkSlice.actions;

export default apkSlice.reducer;
