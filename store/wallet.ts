import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState } from "./stateLoader";

interface storeProps {
  money: number;
}

let initialState: storeProps = {
  money: 0,
};

const stateName = "walletState";

initialState = loadState(initialState, stateName);

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    add(state, action) {
      state.money += action.payload;
      saveState(state, stateName);
    },
    spend(state, action) {
      state.money -= action.payload;
      saveState(state, stateName);
    },
    update(state, action) {
      state.money = action.payload;
      saveState(state, stateName);
    },
  },
});

export const walletActions = slice.actions;
export default slice.reducer;
