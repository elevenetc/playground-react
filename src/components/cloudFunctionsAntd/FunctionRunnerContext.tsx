import {createContext, useContext} from 'react';
import {FunctionData} from './FunctionData';
import {CallController} from './CallController';

export type GraphState = 'idle' | 'running' | 'connecting';
export type HandleType = 'source' | 'target';

type ConnectingInfo = {
    sourceFunctionId: string;
    sourceHandleId: string;
    handleType: HandleType;
} | null;

type FunctionCallGraphContextType = {
    runFunction: (functionId: string) => void;
    selectFunction: (functionData: FunctionData) => void;
    selectedFunctionId: string | null;
    state: GraphState;
    connectionController: CallController;
    connectingInfo: ConnectingInfo;
};

export const FunctionCallGraphContext = createContext<FunctionCallGraphContextType | null>(null);

export const useFunctionCallGraph = () => {
    return useContext(FunctionCallGraphContext);
};