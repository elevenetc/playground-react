import {AppDispatch, RootState} from './store';
import {functionCreated, functionDeleted, functionStateChanged} from '../namespaces/namespacesSlice';
import {CloudKotlinFunctionsApi} from '../api/CloudKotlinFunctionsApi';
import {dtoToFunction} from "@/components/cloudFunctionsAntd/dto/dtoToFunction";
import {Namespace} from '../namespaces/Namespace';

export function subscribeToFunctionEvents(
    api: CloudKotlinFunctionsApi,
    dispatch: AppDispatch,
    getState: () => RootState,
    defaultNamespaceId: string
) {
    api.subscribeToFunctionEvents((_eventId, eventType, functionDto, error) => {
        if (error) {
            console.error('Function error:', error);
            return;
        }

        const func = dtoToFunction(functionDto);

        // Helper to find namespace for a function
        const findNamespaceId = (functionId: string): string | null => {
            const state = getState();
            const namespaces = Object.values(state.namespaces.entities) as (Namespace | undefined)[];
            const namespace = namespaces.find((ns) =>
                ns?.functions.some((f) => f.id === functionId)
            );
            return namespace?.id || null;
        };

        switch (eventType) {
            case 'created':
                // New functions go to the default namespace
                dispatch(functionCreated({namespaceId: defaultNamespaceId, function: func}));
                break;
            case 'deleted':
                const deleteNamespaceId = findNamespaceId(functionDto.id);
                if (deleteNamespaceId) {
                    dispatch(functionDeleted({namespaceId: deleteNamespaceId, functionId: functionDto.id}));
                }
                break;
            case 'state-changed':
                const stateNamespaceId = findNamespaceId(functionDto.id);
                if (stateNamespaceId) {
                    dispatch(functionStateChanged({
                        namespaceId: stateNamespaceId,
                        functionId: functionDto.id,
                        newState: func.state
                    }));
                }
                break;
        }
    });
}
