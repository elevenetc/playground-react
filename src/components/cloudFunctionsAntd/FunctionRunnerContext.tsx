import {createContext, useContext} from 'react';
import {FunctionData} from './FunctionData';

type FunctionRunnerContextType = {
    runFunction: (functionId: string) => void;
    selectFunction: (functionData: FunctionData) => void;
    selectedFunctionId: string | null;
    isRunning: boolean;
};

export const FunctionRunnerContext = createContext<FunctionRunnerContextType | null>(null);

export const useFunctionRunner = () => {
    return useContext(FunctionRunnerContext);
};