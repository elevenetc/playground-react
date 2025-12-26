import {createContext, useContext} from 'react';
import {Function} from './Function';
import {CallController} from './CallController';

export type ProjectState = 'idle' | 'running' | 'connecting';
export type ConnectionType = 'source' | 'target';

type ConnectingInfo = {
    sourceFunctionId: string;
    sourceHandleId: string;
    connectionType: ConnectionType;
} | null;

type ProjectContextType = {
    runFunction: (functionId: string) => void;
    selectFunction: (functionData: Function) => void;
    selectedFunctionId: string | null;
    state: ProjectState;
    connectionController: CallController;
    connectingInfo: ConnectingInfo;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () => {
    return useContext(ProjectContext);
};