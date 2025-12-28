import {Function} from '../../cloudFunctionsAntd/Function';

export type Namespace = {
    id: string;
    name: string;
    createAt: string;
    updatedAt: string;
    functions: Function[];
}