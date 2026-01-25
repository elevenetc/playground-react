import {CanRunResult} from './canRun';

export type CallGroup = {
    id: string;
    functionIds: Set<string>;
    rootIds: string[];
    canRun: CanRunResult;
};
