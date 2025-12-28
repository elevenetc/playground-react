import {createAsyncThunk, createEntityAdapter, createSlice} from "@reduxjs/toolkit";
import {RootState} from "@/components/cloudFunctionsAntd/state/store";
import {api} from "@/components/cloudFunctionsAntd/api/FakeCloudKotlinFunctionsApi";
import {Namespace} from "@/components/cloudFunctionsAntd/namespaces/Namespace";
import {NamespaceDto} from "@/components/cloudFunctionsAntd/dto/dto";
import {dtoToNamespace} from "@/components/cloudFunctionsAntd/dto/dtoToNamespace";

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
        namespaceRemoved: namespacesAdapter.removeOne
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
                state.error = action.error.message ?? "Failed to load chats";
            });
    }
})

export const {namespaceUpserted, namespacesUpserted, namespaceRemoved} = namespacesSlice.actions;
export default namespacesSlice.reducer;

export const namespacesSelectors = namespacesAdapter.getSelectors<RootState>((s) => s.namespaces);
export const selectNamespacesLoading = (s: RootState) => s.namespaces.loading;
export const selectNamespacesError = (s: RootState) => s.namespaces.error;