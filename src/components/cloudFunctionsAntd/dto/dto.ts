import {FunctionConnectionDto, FunctionDto} from "@/components/cloudFunctionsAntd/api/CloudKotlinFunctionsApi";

export type NamespaceDto = {
    id: string;
    name: string;
    createAt: string;
    updatedAt: string;
    functions: FunctionDto[];
    connections: FunctionConnectionDto[];
}