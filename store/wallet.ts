import { createSlice } from "@reduxjs/toolkit";

interface storeProps {
  money: number;
}

let initialState: storeProps = {
  money: 0,
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    add(state, action) {
      state.money += action.payload;
    },
    spend(state, action) {
      state.money -= action.payload;
    },
  },
});

export const walletActions = slice.actions;
export default slice.reducer;
