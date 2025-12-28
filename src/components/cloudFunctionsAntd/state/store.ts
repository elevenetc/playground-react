import {configureStore} from '@reduxjs/toolkit';
import projectReducer from './projectSlice';
import uiReducer from './uiSlice';
import namespacesSlice from "@/components/cloudFunctionsAntd/namespaces/namespacesSlice";

export const store = configureStore({
    reducer: {
        project: projectReducer,
        ui: uiReducer,
        namespaces: namespacesSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state for serialization checks
                // since Function and FunctionConnection are class instances
                ignoredPaths: ['project.functions', 'project.connections'],
                ignoredActions: [
                    'project/functionCreated',
                    'project/functionDeleted',
                    'project/functionStateChanged',
                    'project/connectionAdded',
                    'project/connectionRemoved',
                    'project/projectLoaded',
                ],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
