import {Function} from "@/components/cloudFunctionsAntd/Function";
import {Namespace} from "@/components/cloudFunctionsAntd/namespaces/Namespace";
import {NamespaceDto} from "@/components/cloudFunctionsAntd/dto/dto";
import {dtoToFunction} from "@/components/cloudFunctionsAntd/dto/dtoToFunction";

export const dtoToNamespace = (dto: NamespaceDto): Namespace => {
    const functions: Function[] = dto.functions.map(fun => dtoToFunction(fun));
    return {
        id: dto.id,
        name: dto.name,
        functions: functions,
        createAt: dto.createAt,
        updatedAt: dto.updatedAt
    };
};
