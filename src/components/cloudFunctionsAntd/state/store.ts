import {configureStore} from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import namespacesSlice from "@/components/cloudFunctionsAntd/namespaces/namespacesSlice";

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        namespaces: namespacesSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state for serialization checks
                // since Function and FunctionConnection are class instances
                ignoredPaths: ['namespaces.entities'],
                ignoredActions: [
                    'namespaces/functionCreated',
                    'namespaces/functionDeleted',
                    'namespaces/functionStateChanged',
                    'namespaces/connectionAdded',
                    'namespaces/connectionRemoved',
                ],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
