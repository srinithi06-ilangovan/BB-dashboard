import { createSlice } from "@reduxjs/toolkit";

const excelSlice = createSlice({
    name: "excel",
    initialState: {
        data: [],
    },
    reducers: {
        setExcelData: (state, action) =>{
            state.data = action.payload;
        },
    },
});

export const { setExcelData } = excelSlice.actions;
export default excelSlice.reducer;