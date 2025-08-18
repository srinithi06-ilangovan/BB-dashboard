import { configureStore } from "@reduxjs/toolkit";
import excelReducer from "./excelSlice"
import ticketReducer from "./ticketSlice"
import fileReducer from  "./fileSlice"
import dodReducer from  "./dodSlice"
import aiReportReducer from  "./aiReportSlice"
import sheetNameReducer, { setSheetName } from  "./sheetNameSlice"

const store = configureStore({
    reducer : {
        excel: excelReducer,
        ticket: ticketReducer,
        file: fileReducer,
        dod: dodReducer,
        aiReport: aiReportReducer,
        sheetName: sheetNameReducer

    },
});

export default store;