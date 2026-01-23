import {ConnectionType, NamespaceState} from "@/components/cloudFunctionsAntd/FunctionRunnerContext";

export interface UiState {
    selectedFunctionId: string | null;
    namespaceState: NamespaceState;
    selectedNamespaceId: string | null;
    connectingInfo: {
        sourceFunctionId: string;
        sourceHandleId: string;
        connectionType: ConnectionType;
    } | null;
}