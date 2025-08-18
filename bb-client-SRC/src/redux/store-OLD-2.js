import { configureStore } from "@reduxjs/toolkit";
import excelReducer from "./excelSlice"
import ticketReducer from "./ticketSlice"
import fileReducer from  "./fileSlice"
import dodReducer from  "./dodSlice"

const store = configureStore({
    reducer : {
        excel: excelReducer,
        ticket: ticketReducer,
        file: fileReducer,
        dod: dodReducer,
    },
});

export default store;