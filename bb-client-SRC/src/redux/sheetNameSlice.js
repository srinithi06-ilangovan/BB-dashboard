import { createSlice } from "@reduxjs/toolkit";

const sheetNameSlice = createSlice({
    name: "sheetName",
    initialState: {
        data: '',
    },
    reducers: {
        setSheetName: (state, action) =>{
            state.data = action.payload;
        },
    },
});

export const { setSheetName } = sheetNameSlice.actions;
export default sheetNameSlice.reducer;