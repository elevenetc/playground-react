import {create} from 'zustand';
import {Edge} from 'reactflow';
import {Namespace} from '../namespaces/Namespace';
import {Function, FunctionState} from '../Function';
import {FunctionConnection} from '../FunctionConnection';
import {NamespaceState} from '../state/NamespaceState';
import {ConnectionType} from '../state/ConnectionType';
import {CallConnectionUtils} from '../callConnectionUtils';
import {api} from '../api/FakeCloudKotlinFunctionsApi';
import {dtoToNamespace} from '../dto/dtoToNamespace';

// Stable empty arrays to avoid creating new references
const EMPTY_FUNCTIONS: Function[] = [];
const EMPTY_CONNECTIONS: FunctionConnection[] = [];

type ConnectingInfo = {
    sourceFunctionId: string;
    sourceHandleId: string;
    connectionType: ConnectionType;
} | null;

type LoadingState = 'loading' | 'loaded' | 'loadingError';

interface AppState {
    // UI state
    selectedFunctionId: string | null;
    selectedNamespaceId: string | null;
    namespaceState: NamespaceState;
    connectingInfo: ConnectingInfo;

    // Namespaces state
    namespaces: Namespace[];
    loading: LoadingState;
    error: string | null;
}

interface AppActions {
    // UI actions
    selectFunction: (id: string | null) => void;
    selectNamespace: (id: string | null) => void;
    setNamespaceState: (state: NamespaceState) => void;
    setConnectingInfo: (info: ConnectingInfo) => void;

    // Namespace actions
    fetchNamespaces: () => void;
    upsertNamespaces: (namespaces: Namespace[]) => void;

    // Function actions
    addFunction: (namespaceId: string, func: Function) => void;
    deleteFunction: (namespaceId: string, functionId: string) => void;
    setFunctionState: (namespaceId: string, functionId: string, state: FunctionState) => void;
    runFunction: (functionId: string) => void;

    // Connection actions
    addConnection: (namespaceId: string, outFunctionId: string, targetFunctionId: string, targetArgIndex: number) => void;
    removeConnection: (namespaceId: string, outFunctionId: string, targetFunctionId: string, targetArgIndex: number) => void;

    // Derived getters
    getSelectedNamespace: () => Namespace | null;
    getSelectedNamespaceFunctions: () => Record<string, Function>;
    getSelectedNamespaceFunctionsArray: () => Function[];
    getSelectedNamespaceConnections: () => FunctionConnection[];
    getEdges: () => Edge[];
    getSelectedFunction: () => Function | null;
    findNamespaceIdByFunctionId: (functionId: string) => string | null;
    getAllFunctions: () => Record<string, Function>;
}

export const useStore = create<AppState & AppActions>((set, get) => ({
    // Initial UI state
    selectedFunctionId: null,
    selectedNamespaceId: null,
    namespaceState: 'idle',
    connectingInfo: null,

    // Initial namespaces state
    namespaces: [],
    loading: 'loading',
    error: null,

    // UI actions
    selectFunction: (id) => set({selectedFunctionId: id}),
    selectNamespace: (id) => set({selectedNamespaceId: id}),
    setNamespaceState: (state) => set({namespaceState: state}),
    setConnectingInfo: (info) => set({connectingInfo: info}),

    // Namespace actions
    fetchNamespaces: () => {
        set({loading: 'loading', error: null});
        try {
            const dtos = api.getNamespaces();
            const namespaces = dtos.map(dtoToNamespace);
            set({namespaces, loading: 'loaded'});
        } catch (e) {
            set({loading: 'loadingError', error: e instanceof Error ? e.message : 'Failed to load'});
        }
    },

    upsertNamespaces: (newNamespaces) => set((state) => {
        const namespaceMap = new Map(state.namespaces.map(ns => [ns.id, ns]));
        newNamespaces.forEach(ns => namespaceMap.set(ns.id, ns));
        return {namespaces: Array.from(namespaceMap.values())};
    }),

    // Function actions
    addFunction: (namespaceId, func) => set((state) => ({
        namespaces: state.namespaces.map(ns =>
            ns.id === namespaceId
                ? {...ns, functions: [...ns.functions, func]}
                : ns
        )
    })),

    deleteFunction: (namespaceId, functionId) => set((state) => ({
        namespaces: state.namespaces.map(ns =>
            ns.id === namespaceId
                ? {
                    ...ns,
                    functions: ns.functions.filter(f => f.id !== functionId),
                    connections: ns.connections.filter(
                        c => c.outFunctionId !== functionId && c.targetFunctionId !== functionId
                    )
                }
                : ns
        )
    })),

    setFunctionState: (namespaceId, functionId, newState) => set((state) => ({
        namespaces: state.namespaces.map(ns =>
            ns.id === namespaceId
                ? {
                    ...ns,
                    functions: ns.functions.map(f =>
                        f.id === functionId ? {...f, state: newState} : f
                    )
                }
                : ns
        )
    })),

    runFunction: (functionId) => {
        const namespaceId = get().findNamespaceIdByFunctionId(functionId);
        if (namespaceId) {
            get().setFunctionState(namespaceId, functionId, 'running');
        }
        api.runFunction(functionId);
    },

    // Connection actions
    addConnection: (namespaceId, outFunctionId, targetFunctionId, targetArgIndex) => {
        set((state) => ({
            namespaces: state.namespaces.map(ns => {
                if (ns.id !== namespaceId) return ns;
                const exists = ns.connections.some(
                    c => c.outFunctionId === outFunctionId
                        && c.targetFunctionId === targetFunctionId
                        && c.targetArgIndex === targetArgIndex
                );
                if (exists) return ns;
                return {
                    ...ns,
                    connections: [...ns.connections, new FunctionConnection(outFunctionId, targetFunctionId, targetArgIndex)]
                };
            })
        }));
        api.addConnection(outFunctionId, targetFunctionId, targetArgIndex);
    },

    removeConnection: (namespaceId, outFunctionId, targetFunctionId, targetArgIndex) => {
        set((state) => ({
            namespaces: state.namespaces.map(ns =>
                ns.id === namespaceId
                    ? {
                        ...ns,
                        connections: ns.connections.filter(
                            c => !(c.outFunctionId === outFunctionId
                                && c.targetFunctionId === targetFunctionId
                                && c.targetArgIndex === targetArgIndex)
                        )
                    }
                    : ns
            )
        }));
        api.removeConnection(outFunctionId, targetFunctionId, targetArgIndex);
    },

    // Derived getters
    getSelectedNamespace: () => {
        const {namespaces, selectedNamespaceId} = get();
        return namespaces.find(ns => ns.id === selectedNamespaceId) || null;
    },

    getSelectedNamespaceFunctions: () => {
        const namespace = get().getSelectedNamespace();
        if (!namespace) return {};
        const map: Record<string, Function> = {};
        namespace.functions.forEach(f => map[f.id] = f);
        return map;
    },

    getSelectedNamespaceFunctionsArray: () => {
        const namespace = get().getSelectedNamespace();
        return namespace?.functions ?? EMPTY_FUNCTIONS;
    },

    getSelectedNamespaceConnections: () => {
        const namespace = get().getSelectedNamespace();
        return namespace?.connections ?? EMPTY_CONNECTIONS;
    },

    getEdges: () => {
        const connections = get().getSelectedNamespaceConnections();
        return connections.map((conn) => ({
            id: `e::${conn.outFunctionId}::${conn.targetFunctionId}::${conn.targetArgIndex}`,
            source: conn.outFunctionId,
            target: conn.targetFunctionId,
            sourceHandle: CallConnectionUtils.createOutputId(),
            targetHandle: CallConnectionUtils.createInputId(conn.targetArgIndex),
        }));
    },

    getSelectedFunction: () => {
        const {selectedFunctionId} = get();
        if (!selectedFunctionId) return null;
        const functions = get().getAllFunctions();
        return functions[selectedFunctionId] || null;
    },

    findNamespaceIdByFunctionId: (functionId) => {
        const {namespaces} = get();
        const ns = namespaces.find(ns => ns.functions.some(f => f.id === functionId));
        return ns?.id || null;
    },

    getAllFunctions: () => {
        const {namespaces} = get();
        const map: Record<string, Function> = {};
        namespaces.forEach(ns => ns.functions.forEach(f => map[f.id] = f));
        return map;
    }
}));
