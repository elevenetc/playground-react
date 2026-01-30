import {CloudKotlinFunctionsApi} from '../api/CloudKotlinFunctionsApi';
import {dtoToFunction} from '../dto/dtoToFunction';
import {dtoToCallGroup} from '../dto/dtoToCallGroup';
import {dtoToExecutionLog} from '../dto/dtoToExecutionLog';
import {useStore} from './store';

export function subscribeToEvents(
    api: CloudKotlinFunctionsApi,
    defaultNamespaceId: string
): () => void {
    const {
        addFunction,
        deleteFunction,
        setFunctionState,
        findNamespaceIdByFunctionId,
        upsertCallGroup,
        deleteCallGroup,
        addExecutionLog
    } = useStore.getState();

    return api.subscribeToEvents((event) => {

        if (event.kind === 'function') {
            const {eventType, data: functionDto, error} = event;

            if (error) {
                console.error('Function error:', error);
                return;
            }

            const func = dtoToFunction(functionDto);

            switch (eventType) {
                case 'created':
                    addFunction(defaultNamespaceId, func);
                    break;
                case 'deleted': {
                    const namespaceId = findNamespaceIdByFunctionId(functionDto.id);
                    if (namespaceId) {
                        deleteFunction(namespaceId, functionDto.id);
                    }
                    break;
                }
                case 'state-changed': {
                    const namespaceId = findNamespaceIdByFunctionId(functionDto.id);
                    if (namespaceId) {
                        setFunctionState(namespaceId, functionDto.id, func.state);
                    }
                    break;
                }
            }
        } else if (event.kind === 'callGroup') {
            const {eventType, data: callGroupDto} = event;
            const callGroup = dtoToCallGroup(callGroupDto);

            switch (eventType) {
                case 'created':
                case 'updated':
                    upsertCallGroup(callGroup);
                    break;
                case 'deleted':
                    deleteCallGroup(callGroupDto.id);
                    break;
            }
        } else if (event.kind === 'executionLog') {
            const {eventId, eventType, data} = event;
            const logEntry = dtoToExecutionLog(eventId, eventType, data);
            addExecutionLog(logEntry);
        }
    });
}
