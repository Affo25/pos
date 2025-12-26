import { createSlice } from '@reduxjs/toolkit';

const getInitialBranch = () => {
    const savedBranchId = localStorage.getItem('selectedBranchId');
    return savedBranchId || null;
};

const selectedBranchSlice = createSlice({
    name: 'selectedBranch',
    initialState: {
        selectedBranchId: getInitialBranch(),
    },
    reducers: {
        setSelectedBranch: (state, action) => {
            state.selectedBranchId = action.payload;
            localStorage.setItem('selectedBranchId', action.payload);
        },

    },
});

export const { setSelectedBranch } = selectedBranchSlice.actions;
export default selectedBranchSlice.reducer;
