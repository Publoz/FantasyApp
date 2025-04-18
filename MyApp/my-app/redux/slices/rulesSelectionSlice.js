import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchClient from '../../utils/apiCaller'

export const fetchSelectionRules = createAsyncThunk('team/fetchSelectionRules', async (roundId, { getState }) => {
  console.log('fetchSelectionRules thunk');

  const state = getState();

  if (state.selectionRules && state.selectionRules.apiCalled && state.selectionRules.roundId === roundId && state.selectionRules.rulesData) {
    console.log('Returning rules data from state ------' );
    return state.selectionRules.rulesData;
  }

  const response = await fetchClient.get(`/teamSelection/selectionRules?roundId=${roundId}`, {
    validateStatus: function (status) {
      return status >= 200 && status < 500;
    },
  });

  if (response.data && response.data.length > 0) {
    return {data: response.data, roundId};
  } else {
    return [];
  }
});

const selectionRulesSlice = createSlice({
  name: 'selectionRules',
  initialState: {
    loading: false,
    rulesData: [],
    roundId: null,
    error: '',
    apiCalled: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSelectionRules.pending, (state) => {
        console.log('fetchSelectionRules pending');
        state.loading = true;
      })
      .addCase(fetchSelectionRules.fulfilled, (state, action) => {
        //console.log('fetchTeamData fulfilled', action.payload);
        state.loading = false;
        state.rulesData = action.payload.data;
        state.roundId = action.payload.roundId;
        state.apiCalled = true;
        state.error = '';
      })
      .addCase(fetchSelectionRules.rejected, (state, action) => {
       // console.log('fetchTeamData rejected', action.error);
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default selectionRulesSlice.reducer;