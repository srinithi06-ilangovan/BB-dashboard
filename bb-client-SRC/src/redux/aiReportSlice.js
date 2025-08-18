import { createSlice } from "@reduxjs/toolkit";

const aiReportSlice = createSlice({
    name: "aiReport",
    initialState: {
        data: null,
    },
    reducers: {
        setAiReportData: (state, action) =>{
            state.data = action.payload;
        },
    },
});

export const { setAiReportData } = aiReportSlice.actions;
export default aiReportSlice.reducer;