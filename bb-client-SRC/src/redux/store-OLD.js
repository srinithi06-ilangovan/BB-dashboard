import { configureStore } from "@reduxjs/toolkit";
import excelReducer from "./excelSlice"
import ticketReducer from "./ticketSlice"
import fileReducer from  "./fileSlice"

const store = configureStore({
    reducer : {
        excel: excelReducer,
        ticket: ticketReducer,
        file: fileReducer,
    },
});

export default store;