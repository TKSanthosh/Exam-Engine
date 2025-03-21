import { configureStore } from '@reduxjs/toolkit';
import CandidateTimerReducer from './CandidateTimeSlice';
import DateFormatReducer from './dateSlice';


const store = configureStore({
    reducer: {
        timer: CandidateTimerReducer,
        date: DateFormatReducer,
    },
})


export default store;