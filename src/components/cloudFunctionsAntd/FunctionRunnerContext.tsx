import {createContext, useContext} from 'react';
import {FunctionData} from './FunctionData';
import {ConnectionController} from './ConnectionController';

export type GraphState = 'idle' | 'running' | 'connecting';

type ConnectingInfo = {
    sourceFunctionId: string;
    sourceHandleId: string;
} | null;

type FunctionCallGraphContextType = {
    runFunction: (functionId: string) => void;
    selectFunction: (functionData: FunctionData) => void;
    selectedFunctionId: string | null;
    state: GraphState;
    connectionController: ConnectionController;
    connectingInfo: ConnectingInfo;
};

export const FunctionCallGraphContext = createContext<FunctionCallGraphContextType | null>(null);

export const useFunctionCallGraph = () => {
    return useContext(FunctionCallGraphContext);
};