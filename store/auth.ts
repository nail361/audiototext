import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState } from "./stateLoader";

interface storeProps {
  isAuth: boolean;
  email: string;
  token: string;
}

let initialState: storeProps = {
  isAuth: false,
  email: "",
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
      state.token = action.payload.token;
      state.email = action.payload.email;
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
