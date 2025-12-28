import {Function} from '../../cloudFunctionsAntd/Function';
import {FunctionConnection} from "@/components/cloudFunctionsAntd/FunctionConnection";

export type Namespace = {
    id: string;
    name: string;
    createAt: string;
    updatedAt: string;
    functions: Function[];
    connections: FunctionConnection[];
}