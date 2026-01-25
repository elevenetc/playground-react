import {CanRunResult} from './canRun';

export type CallGroup = {
    id: string;
    namespaceId: string;
    functionIds: Set<string>;
    rootFunctionIds: string[];
    canRun: CanRunResult;
};
