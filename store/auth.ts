import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState } from "./stateLoader";

interface storeProps {
  isAuth: boolean;
  token: string;
}

let initialState: storeProps = {
  isAuth: false,
  token: "",
};

const stateName = "authState";

initialState = loadState(initialState, stateName);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.isAuth = true;
      state.token = action.payload;
      saveState(state, stateName);
    },
    logout(state) {
      state.isAuth = false;
      saveState(state, stateName);
    },
  },
});

export const authActions = slice.actions;
export default slice.reducer;
