import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchClient from '../../utils/apiCaller'

export const fetchUsersCompetitions = createAsyncThunk('users/competitions', async (_, { getState, rejectWithValue }) => {
  console.log('users competition thunk');
  const state = getState().usersCompetitions;

  if (state && state.apiCalled && state.competitionData) {
    console.log('return comp data stored');
    return state.usersCompetitions.competitionData;
  }

  try {
    const response = await fetchClient.get('/users/competitions', {
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log('blah blah');
  if (response.data && response.data.length > 0) {
    console.log(response.data);
    return response.data;
  } else {
    return [];
  }

  } catch (error) {
    console.error('Error fetching users competitions ', error.message);
    return rejectWithValue(error.response.data);
  } 

});

const usersCompetitionsSlice = createSlice({
  name: 'usersCompetitions',
  initialState: {
    loading: false,
    competitionData: [],
    error: '',
    apiCalled: false,
    selectedCompetition: null, //roundId
    roundAlias: null,
  },
  reducers: {
    setSelectedCompetition: (state, action) => {
      state.selectedCompetition = action.payload;
    },
    setRoundAlias: (state, action) => {
      state.roundAlias = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersCompetitions.pending, (state) => {
        console.log('fetchTeamData pending');
        state.loading = true;
      })
      .addCase(fetchUsersCompetitions.fulfilled, (state, action) => {
        //console.log('fetchTeamData fulfilled', action.payload);
        state.loading = false;
        state.competitionData = action.payload;
        state.apiCalled = true;
        state.error = '';
      })
      .addCase(fetchUsersCompetitions.rejected, (state, action) => {
        // console.log('fetchTeamData rejected', action.error);
        state.loading = false;
        state.error = action.payload || 'Failed to fetch competitions';
      });
  },
});

export const { setSelectedCompetition, setRoundAlias } = usersCompetitionsSlice.actions;

export default usersCompetitionsSlice.reducer;