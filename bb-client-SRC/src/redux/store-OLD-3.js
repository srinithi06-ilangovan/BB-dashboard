import { configureStore } from "@reduxjs/toolkit";
import excelReducer from "./excelSlice"
import ticketReducer from "./ticketSlice"
import fileReducer from  "./fileSlice"
import dodReducer from  "./dodSlice"
import aiReportReducer from  "./aiReportSlice"

const store = configureStore({
    reducer : {
        excel: excelReducer,
        ticket: ticketReducer,
        file: fileReducer,
        dod: dodReducer,
        aiReport: aiReportReducer,
    },
});

export default store;