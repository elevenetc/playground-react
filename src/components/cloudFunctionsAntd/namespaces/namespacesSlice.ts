import {createAsyncThunk, createEntityAdapter, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/components/cloudFunctionsAntd/state/store";
import {api} from "@/components/cloudFunctionsAntd/api/FakeCloudKotlinFunctionsApi";
import {Namespace} from "@/components/cloudFunctionsAntd/namespaces/Namespace";
import {NamespaceDto} from "@/components/cloudFunctionsAntd/dto/dto";
import {dtoToNamespace} from "@/components/cloudFunctionsAntd/dto/dtoToNamespace";
import {Function, FunctionState} from "@/components/cloudFunctionsAntd/Function";
import {FunctionConnection} from "@/components/cloudFunctionsAntd/FunctionConnection";

const namespacesAdapter = createEntityAdapter<Namespace>({
    sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
});

type NamespacesState = ReturnType<typeof namespacesAdapter.getInitialState> & {
    loading: "loading" | "loaded" | "loadingError";
    error: string | null;
};

const initState: NamespacesState = {
    ...namespacesAdapter.getInitialState(),
    loading: "loading",
    error: null
}

export const fetchNamespaces = createAsyncThunk("namespaces/fetchNamespaces", async () => {
    const dtos: NamespaceDto[] = api.getNamespaces()
    return dtos.map(dto => dtoToNamespace(dto));
});

const namespacesSlice = createSlice({
    name: "namespaces",
    initialState: initState,
    reducers: {
        namespaceUpserted: namespacesAdapter.upsertOne,
        namespacesUpserted: namespacesAdapter.upsertMany,
        namespaceRemoved: namespacesAdapter.removeOne,
        functionCreated: (state, action: PayloadAction<{ namespaceId: string; function: Function }>) => {
            const namespace = state.entities[action.payload.namespaceId];
            if (namespace) {
                namespace.functions.push(action.payload.function);
            }
        },
        functionDeleted: (state, action: PayloadAction<{ namespaceId: string; functionId: string }>) => {
            const namespace = state.entities[action.payload.namespaceId];
            if (namespace) {
                namespace.functions = namespace.functions.filter(f => f.id !== action.payload.functionId);
                namespace.connections = namespace.connections.filter(
                    conn => conn.outFunctionId !== action.payload.functionId && conn.targetFunctionId !== action.payload.functionId
                );
            }
        },
        functionStateChanged: (state, action: PayloadAction<{
            namespaceId: string;
            functionId: string;
            newState: FunctionState
        }>) => {
            const namespace = state.entities[action.payload.namespaceId];
            if (namespace) {
                const func = namespace.functions.find(f => f.id === action.payload.functionId);
                if (func) {
                    func.state = action.payload.newState;
                }
            }
        },
        connectionAdded: (state, action: PayloadAction<{
            namespaceId: string;
            outFunctionId: string;
            targetFunctionId: string;
            targetArgIndex: number
        }>) => {
            const namespace = state.entities[action.payload.namespaceId];
            if (namespace) {
                const {outFunctionId, targetFunctionId, targetArgIndex} = action.payload;
                const exists = namespace.connections.some(
                    conn => conn.outFunctionId === outFunctionId
                        && conn.targetFunctionId === targetFunctionId
                        && conn.targetArgIndex === targetArgIndex
                );
                if (!exists) {
                    namespace.connections.push(new FunctionConnection(outFunctionId, targetFunctionId, targetArgIndex));
                }
            }
        },
        connectionRemoved: (state, action: PayloadAction<{
            namespaceId: string;
            outFunctionId: string;
            targetFunctionId: string;
            targetArgIndex: number
        }>) => {
            const namespace = state.entities[action.payload.namespaceId];
            if (namespace) {
                const {outFunctionId, targetFunctionId, targetArgIndex} = action.payload;
                namespace.connections = namespace.connections.filter(
                    conn => !(conn.outFunctionId === outFunctionId
                        && conn.targetFunctionId === targetFunctionId
                        && conn.targetArgIndex === targetArgIndex)
                );
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNamespaces.pending, (state) => {
                state.loading = "loading";
                state.error = null;
            })
            .addCase(fetchNamespaces.fulfilled, (state, action) => {
                state.loading = "loaded";
                namespacesAdapter.setAll(state, action.payload);
            })
            .addCase(fetchNamespaces.rejected, (state, action) => {
                state.loading = "loadingError";
                state.error = action.error.message ?? "Failed to load namespaces";
            });
    }
})

export const {
    namespaceUpserted,
    namespacesUpserted,
    namespaceRemoved,
    functionCreated,
    functionDeleted,
    functionStateChanged,
    connectionAdded,
    connectionRemoved
} = namespacesSlice.actions;

export default namespacesSlice.reducer;

export const namespacesSelectors = namespacesAdapter.getSelectors<RootState>((s) => s.namespaces);
export const selectNamespacesLoading = (s: RootState) => s.namespaces.loading;
export const selectNamespacesError = (s: RootState) => s.namespaces.error;