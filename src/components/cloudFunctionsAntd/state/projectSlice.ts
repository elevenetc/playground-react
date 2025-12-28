import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Function, FunctionState} from '../Function';
import {FunctionConnection} from '../FunctionConnection';

interface ProjectSliceState {
    functions: Record<string, Function>;
    connections: FunctionConnection[];
}

const initialState: ProjectSliceState = {
    functions: {},
    connections: [],
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        functionCreated: (state, action: PayloadAction<Function>) => {
            state.functions[action.payload.id] = action.payload;
        },
        functionDeleted: (state, action: PayloadAction<string>) => {
            delete state.functions[action.payload];
            // Remove connections where deleted function is source OR target
            state.connections = state.connections.filter(
                conn => conn.outFunctionId !== action.payload && conn.targetFunctionId !== action.payload
            );
        },
        functionStateChanged: (state, action: PayloadAction<{ id: string; newState: FunctionState }>) => {
            const func = state.functions[action.payload.id];
            if (func) {
                state.functions[action.payload.id] = new Function(
                    func.id,
                    func.name,
                    func.arguments,
                    func.returnType,
                    func.sourceCode,
                    action.payload.newState
                );
            }
        },
        connectionAdded: (state, action: PayloadAction<{
            outFunctionId: string;
            targetFunctionId: string;
            targetArgIndex: number
        }>) => {
            const {outFunctionId, targetFunctionId, targetArgIndex} = action.payload;
            const exists = state.connections.some(
                conn => conn.outFunctionId === outFunctionId
                    && conn.targetFunctionId === targetFunctionId
                    && conn.targetArgIndex === targetArgIndex
            );
            if (!exists) {
                state.connections.push(new FunctionConnection(outFunctionId, targetFunctionId, targetArgIndex));
            }
        },
        connectionRemoved: (state, action: PayloadAction<{
            outFunctionId: string;
            targetFunctionId: string;
            targetArgIndex: number
        }>) => {
            const {outFunctionId, targetFunctionId, targetArgIndex} = action.payload;
            state.connections = state.connections.filter(
                conn => !(conn.outFunctionId === outFunctionId
                    && conn.targetFunctionId === targetFunctionId
                    && conn.targetArgIndex === targetArgIndex)
            );
        },
        projectLoaded: (state, action: PayloadAction<{ functions: Function[]; connections: FunctionConnection[] }>) => {
            state.functions = {};
            action.payload.functions.forEach(func => {
                state.functions[func.id] = func;
            });
            state.connections = action.payload.connections;
        },
    },
});

export const {
    functionCreated,
    functionDeleted,
    functionStateChanged,
    connectionAdded,
    connectionRemoved,
    projectLoaded,
} = projectSlice.actions;

export default projectSlice.reducer;
