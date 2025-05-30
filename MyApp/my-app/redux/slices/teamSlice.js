import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchClient from '../../utils/apiCaller'

export const fetchTeamData = createAsyncThunk('team/fetchTeamData', async (roundId, { getState }) => {
  console.log('fetchTeamData thunk');
  const state = getState();
  //console.log(state);

  //TODO: Investigate apiCalled working properly
  if (state.team && state.team.apiCalled && state.team.teamData && state.team.roundId === roundId) {
    console.log('Returning teamData from state ------' );
    return state.team.teamData;
  }

  const response = await fetchClient.get(`/teamSelection/team?roundId=${roundId}`, {
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

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    loading: false,
    teamData: [],
    roundId: null,
    error: '',
    apiCalled: false,
  },
  reducers: {setTeamData: (state, action) => {
    state.teamData = action.payload;
  }},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamData.pending, (state) => {
        console.log('fetchTeamData pending');
        state.loading = true;
      })
      .addCase(fetchTeamData.fulfilled, (state, action) => {
        //console.log('fetchTeamData fulfilled', action.payload);
        state.loading = false;
        state.teamData = action.payload.data;
        state.roundId = action.payload.roundId;
        state.apiCalled = true;
        state.error = '';
      })
      .addCase(fetchTeamData.rejected, (state, action) => {
       // console.log('fetchTeamData rejected', action.error);
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setTeamData } = teamSlice.actions;
export default teamSlice.reducer;