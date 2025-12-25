import {createContext, useContext} from 'react';
import {Function} from './Function';
import {CallController} from './CallController';

export type GraphState = 'idle' | 'running' | 'connecting';
export type HandleType = 'source' | 'target';

type ConnectingInfo = {
    sourceFunctionId: string;
    sourceHandleId: string;
    handleType: HandleType;
} | null;

type ProjectContextType = {
    runFunction: (functionId: string) => void;
    selectFunction: (functionData: Function) => void;
    selectedFunctionId: string | null;
    state: GraphState;
    connectionController: CallController;
    connectingInfo: ConnectingInfo;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () => {
    return useContext(ProjectContext);
};