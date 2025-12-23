import {createContext, useContext} from 'react';

type FunctionRunnerContextType = {
    runFunction: (functionId: string) => void;
};

export const FunctionRunnerContext = createContext<FunctionRunnerContextType | null>(null);

export const useFunctionRunner = () => {
    return useContext(FunctionRunnerContext);
};