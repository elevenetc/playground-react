import {ConnectionType, ProjectState} from "@/components/cloudFunctionsAntd/FunctionRunnerContext";

export interface UiState {
    selectedFunctionId: string | null;
    projectState: ProjectState;
    selectedNamespaceId: string | null;
    connectingInfo: {
        sourceFunctionId: string;
        sourceHandleId: string;
        connectionType: ConnectionType;
    } | null;
}