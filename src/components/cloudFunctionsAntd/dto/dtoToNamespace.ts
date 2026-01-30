import {Function} from "@/components/cloudFunctionsAntd/Function";
import {Namespace} from "@/components/cloudFunctionsAntd/namespaces/Namespace";
import {NamespaceDto} from "@/components/cloudFunctionsAntd/dto/dto";
import {dtoToFunction} from "@/components/cloudFunctionsAntd/dto/dtoToFunction";
import {FunctionConnection} from "@/components/cloudFunctionsAntd/FunctionConnection";

export const dtoToNamespace = (dto: NamespaceDto): Namespace => {
    const functions: Function[] = dto.functions.map(fun => dtoToFunction(fun));
    const connections: FunctionConnection[] = dto.connections.map(conn =>
        FunctionConnection.fromArgumentId(conn.outFunctionId, conn.inputArgumentId)
    );
    return {
        id: dto.id,
        name: dto.name,
        functions: functions,
        connections: connections,
        createAt: dto.createAt,
        updatedAt: dto.updatedAt
    };
};
