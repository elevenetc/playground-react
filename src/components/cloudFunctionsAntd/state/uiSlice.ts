import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {NamespaceState} from '../FunctionRunnerContext';
import {UiState} from "@/components/cloudFunctionsAntd/state/UiState";

const initialState: UiState = {
    selectedFunctionId: null,
    selectedNamespaceId: null,
    namespaceState: 'idle',
    connectingInfo: null
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        functionSelected: (state, action: PayloadAction<string | null>) => {
            state.selectedFunctionId = action.payload;
        },
        namespaceSelected: (state, action: PayloadAction<string | null>) => {
            state.selectedNamespaceId = action.payload;
        },
        namespaceStateChanged: (state, action: PayloadAction<NamespaceState>) => {
            state.namespaceState = action.payload;
        },
        connectingInfoSet: (state, action: PayloadAction<UiState['connectingInfo']>) => {
            state.connectingInfo = action.payload;
        },
    },
});

export const {functionSelected, namespaceSelected, namespaceStateChanged, connectingInfoSet} = uiSlice.actions;

export default uiSlice.reducer;
