import {createSlice} from '@reduxjs/toolkit';

const CandidateTimeSlice = createSlice({
    name:"timer",
    initialState: {
        value: 3600,
    },
    reducers: {
        timeStore: (state) => {
            state.value -= 1;
        },
        timeResetStore: (state, action) => {
            state.value = action.payload;
        }
    }
});


export const {timeStore,timeResetStore}=CandidateTimeSlice.actions;

export default CandidateTimeSlice.reducer;