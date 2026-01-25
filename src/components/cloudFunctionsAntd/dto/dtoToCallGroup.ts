import {CallGroupDto} from '../api/CloudKotlinFunctionsApi';
import {CallGroup} from '../CallGroup';
import {CanRunReason, CanRunResult, StreamLocation} from '../canRun';

export function dtoToCallGroup(dto: CallGroupDto): CallGroup {
    return {
        id: dto.id,
        namespaceId: dto.namespaceId,
        functionIds: new Set(dto.functionIds),
        rootFunctionIds: dto.rootFunctionIds,
        canRun: dtoToCanRunResult(dto.canRun)
    };
}

function dtoToCanRunResult(dto: CallGroupDto['canRun']): CanRunResult {
    if (dto.can) {
        return {can: true};
    }

    return {
        can: false,
        reasons: dto.reasons.map(r => ({
            type: r.type,
            location: r.location as StreamLocation,
            functionId: r.functionId,
            functionName: r.functionName,
            ...(r.state !== undefined && {state: r.state}),
            ...(r.argumentName !== undefined && {argumentName: r.argumentName}),
            ...(r.argumentIndex !== undefined && {argumentIndex: r.argumentIndex})
        } as CanRunReason))
    };
}
