import {ExecutionLogDto, ExecutionLogEventType} from '../api/CloudKotlinFunctionsApi';
import {ExecutionLogEntry} from '../ExecutionLog';

export function dtoToExecutionLog(
    eventId: string,
    eventType: ExecutionLogEventType,
    dto: ExecutionLogDto
): ExecutionLogEntry {
    return {
        id: eventId,
        callGroupId: dto.callGroupId,
        runId: dto.runId,
        timestamp: new Date(dto.timestamp),
        type: eventType,
        functionId: dto.functionId,
        functionName: dto.functionName,
        parameters: dto.parameters,
        returnValue: dto.returnValue,
        error: dto.error
    };
}
