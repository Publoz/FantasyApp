import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchClient from '../../utils/apiCaller'

export const fetchPlayerSelectionData = createAsyncThunk('team/fetchPlayerSelectionData', async (competitionId, { getState }) => {
  console.log('fetchPlayerSelectionData thunk');
  const state = getState();
 
  if (state.apiCalled && state.playerSelection && state.playerSelection.playersData) {
    return state.playerSelection.playersData;
  }

  const response = await fetchClient.get(`/teamSelection/players?competitionId=${competitionId}`, {
    validateStatus: function (status) {
      return status >= 200 && status < 500;
    },
  });

  if (response.data && response.data.length > 0) {
    return response.data;
  } else {
    return [];
  }
});

const playerSelectionSlice = createSlice({
  name: 'playerSelection',
  initialState: {
    loading: false,
    playersData: [],
    error: '',
    apiCalled: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerSelectionData.pending, (state) => {
        console.log('fetchPlayerSelectionData pending');
        state.loading = true;
      })
      .addCase(fetchPlayerSelectionData.fulfilled, (state, action) => {
        //console.log('fetchTeamData fulfilled', action.payload);
        state.loading = false;
        state.playersData = action.payload;
        state.apiCalled = true;
        state.error = '';
      })
      .addCase(fetchPlayerSelectionData.rejected, (state, action) => {
       // console.log('fetchTeamData rejected', action.error);
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default playerSelectionSlice.reducer;