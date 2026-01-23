import {CloudKotlinFunctionsApi} from '../api/CloudKotlinFunctionsApi';
import {dtoToFunction} from '../dto/dtoToFunction';
import {useStore} from './store';

export function subscribeToFunctionEvents(
    api: CloudKotlinFunctionsApi,
    defaultNamespaceId: string
) {
    const {addFunction, deleteFunction, setFunctionState, findNamespaceIdByFunctionId} = useStore.getState();

    api.subscribeToFunctionEvents((_eventId, eventType, functionDto, error) => {
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
    });
}
