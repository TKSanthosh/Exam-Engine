// dateSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Your formatDate utility function
const formatDate = (inputDate) => {
  const dateObject = new Date(inputDate);

  // Format the date using toLocaleDateString
  const formattedDate = dateObject.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return formattedDate;
};

const dateSlice = createSlice({
  name: 'date',
  initialState: {
    formattedDate: null,
  },
  reducers: {
    setFormattedDate: (state, action) => {
      state.formattedDate = formatDate(action.payload);
    },
  },
});

export const { setFormattedDate } = dateSlice.actions;

export default dateSlice.reducer;
