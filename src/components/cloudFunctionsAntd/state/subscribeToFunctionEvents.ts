import {AppDispatch} from './store';
import {functionCreated, functionDeleted, functionStateChanged} from './projectSlice';
import {CloudKotlinFunctionsApi} from '../api/CloudKotlinFunctionsApi';
import {dtoToFunction} from "@/components/cloudFunctionsAntd/dto/dtoToFunction";

export function subscribeToFunctionEvents(api: CloudKotlinFunctionsApi, dispatch: AppDispatch) {
    api.subscribeToFunctionEvents((_eventId, eventType, functionDto, error) => {
        if (error) {
            console.error('Function error:', error);
            return;
        }

        const func = dtoToFunction(functionDto);

        switch (eventType) {
            case 'created':
                dispatch(functionCreated(func));
                break;
            case 'deleted':
                dispatch(functionDeleted(functionDto.id));
                break;
            case 'state-changed':
                dispatch(functionStateChanged({id: functionDto.id, newState: func.state}));
                break;
        }
    });
}
