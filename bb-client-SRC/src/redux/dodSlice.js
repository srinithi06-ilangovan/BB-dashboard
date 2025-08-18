import { createSlice } from "@reduxjs/toolkit";

const dodSlice = createSlice({
    name: "dod",
    initialState: {
        data: [],
    },
    reducers: {
        setDodData: (state, action) =>{
            state.data = action.payload;
        },
    },
});

export const { setDodData } = dodSlice.actions;
export default dodSlice.reducer;