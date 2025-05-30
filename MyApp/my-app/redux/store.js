import { createSlice, configureStore } from '@reduxjs/toolkit'
import teamReducer from './slices/teamSlice';
import usersCompetitionsReducer from './slices/usersCompetitionSlice';
import playerSelectionReducer from './slices/playerSelectionSlice';
import selectionRulesReducer from './slices/rulesSelectionSlice';

const tokenSlice = createSlice({
    name: 'token',
    initialState: {
      value: ''
    },
    reducers: {
      setToken: (state, action) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
        console.log("Set token reducer");
        console.log(state); //Current state
        console.log(action); //Action.payload has the goods
        return {
            ...state,
            value: action.payload
        }
      },
      clearToken: state => {
        state.value = ''
      }
    }
  })

  export const { setToken, clearToken } = tokenSlice.actions

export const Store = configureStore({
    reducer: {
      token: tokenSlice.reducer,
      team: teamReducer,
      usersCompetitions: usersCompetitionsReducer,
      playerSelection: playerSelectionReducer,
      selectionRules: selectionRulesReducer,
    },
  })