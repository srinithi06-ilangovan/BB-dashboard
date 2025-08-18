import { createSlice } from "@reduxjs/toolkit";

const fileSlice = createSlice({
    name: "file",
    initialState: {
        data: [],
    },
    reducers: {
        setFileData: (state, action) =>{
            state.data = action.payload;
        },
    },
});

export const { setFileData } = fileSlice.actions;
export default fileSlice.reducer;