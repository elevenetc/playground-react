import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ProjectState} from '../FunctionRunnerContext';
import {UiState} from "@/components/cloudFunctionsAntd/state/UiState";

const initialState: UiState = {
    selectedFunctionId: null,
    selectedNamespaceId: null,
    projectState: 'idle',
    connectingInfo: null
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        functionSelected: (state, action: PayloadAction<string | null>) => {
            state.selectedFunctionId = action.payload;
        },
        // namespaceSelected: (state, action: PayloadAction<string | null>) => {
        //     state.selectedNamespaceId = action.payload;
        // },
        projectStateChanged: (state, action: PayloadAction<ProjectState>) => {
            state.projectState = action.payload;
        },
        connectingInfoSet: (state, action: PayloadAction<UiState['connectingInfo']>) => {
            state.connectingInfo = action.payload;
        },
    },
});

export const {functionSelected, projectStateChanged, connectingInfoSet} = uiSlice.actions;
//export const {functionSelected, connectingInfoSet} = uiSlice.actions;

export default uiSlice.reducer;
