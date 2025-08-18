import { createSlice } from "@reduxjs/toolkit";

const ticketSlice = createSlice({
    name: "ticket",
    initialState: {
        data: [],
    },
    reducers: {
        setTicketData: (state, action) => {
            state.data = action.payload;
        },
    },
});

export const { setTicketData } = ticketSlice.actions;
export default ticketSlice.reducer;