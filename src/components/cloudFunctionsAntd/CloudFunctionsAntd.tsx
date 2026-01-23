"use client";

import {useCallback, useEffect, useState} from 'react';
import {applyNodeChanges, Node, NodeChange} from 'reactflow';
import {ConfigProvider, theme} from 'antd';
import {Provider} from 'react-redux';
import NamespacesPanel from './NamespacesPanel';
import DetailsPanel from './DetailsPanel';
import MenuPanel from './MenuPanel';
import {FunctionNodeData} from './FunctionNode';
import FunctionsFlowComponent from './FunctionsFlowComponent';
import {api} from './api/FakeCloudKotlinFunctionsApi';
import {useAppDispatch, useAppSelector} from './state/hooks';
import {
    selectConnectingInfo,
    selectEdges,
    selectFunctionsArray,
    selectNamespaceState,
    selectSelectedFunctionId,
    selectSelectedNamespaceId
} from './state/selectors';
import {connectingInfoSet, functionSelected, namespaceStateChanged} from './state/uiSlice';
import {subscribeToFunctionEvents} from './state/subscribeToFunctionEvents';
import {store} from "@/components/cloudFunctionsAntd/state/store";
import {namespacesUpserted} from './namespaces/namespacesSlice';
import {dtoToNamespace} from './dto/dtoToNamespace';

function CloudFunctionsAntdInner() {
    const dispatch = useAppDispatch();
    const functions = useAppSelector(selectFunctionsArray);
    const edges = useAppSelector(selectEdges);
    const selectedFunctionId = useAppSelector(selectSelectedFunctionId);
    const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId);
    const namespaceState = useAppSelector(selectNamespaceState);
    const connectingInfo = useAppSelector(selectConnectingInfo);

    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // Load initial data from API (runs once on mount)
    useEffect(() => {
        const namespaceDtos = api.getNamespaces();
        if (namespaceDtos.length > 0) {
            const namespaces = namespaceDtos.map(dtoToNamespace);
            dispatch(namespacesUpserted(namespaces));
        }
    }, [dispatch]);

    // Subscribe to function events when namespace changes
    useEffect(() => {
        if (selectedNamespaceId) {
            subscribeToFunctionEvents(api, dispatch, store.getState, selectedNamespaceId);
        }
    }, [dispatch, selectedNamespaceId]);

    // Rebuild nodes when namespace changes to show only selected namespace functions
    useEffect(() => {
        const newNodes: Node<FunctionNodeData>[] = functions.map((func, index) => ({
            id: func.id,
            type: 'functionNode',
            data: {functionData: func},
            position: {x: 100 + index * 350, y: 250},
        }));
        setNodes(newNodes);
    }, [selectedNamespaceId, functions]);

    // Update namespace state based on running functions
    useEffect(() => {
        if (namespaceState !== 'connecting') {
            const hasRunningFunction = functions.some(f => f.state === 'running');
            const newState = hasRunningFunction ? 'running' : 'idle';
            if (namespaceState !== newState) {
                dispatch(namespaceStateChanged(newState));
            }
        }
    }, [functions, dispatch, namespaceState]);

    const handleRunFunction = (functionId: string) => {
        api.runFunction(functionId);
    };

    const handleCreateFunction = (sourceCode: string) => {
        if (!selectedNamespaceId) {
            console.error('No namespace selected');
            return;
        }
        api.createFunction(selectedNamespaceId, sourceCode);
    };

    const handlePaneClick = () => {
        dispatch(functionSelected(null));
    };

    const handleSetState = (newState: typeof namespaceState) => {
        dispatch(namespaceStateChanged(newState));
    };

    const handleSetConnectingInfo = (info: typeof connectingInfo) => {
        dispatch(connectingInfoSet(info));
    };

    const selectedFunction = functions.find(f => f.id === selectedFunctionId) || null;

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
            }}
        >
            <div className="fixed inset-0">
                {/* ReactFlow Background */}
                <div className="absolute inset-0 bg-gray-900">
                    <FunctionsFlowComponent
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        setState={handleSetState}
                        setConnectingInfo={handleSetConnectingInfo}
                        onPaneClick={handlePaneClick}
                    />
                </div>

                {/* Top Menu */}
                <div className="absolute top-2 left-[286px] right-[286px]">
                    <MenuPanel/>
                </div>

                {/* Left Panel */}
                <div className="absolute top-2 left-2 bottom-2 w-[270px]">
                    <NamespacesPanel/>
                </div>

                {/* Right Panel */}
                <div className="absolute top-2 right-2 bottom-2 w-[270px]">
                    <DetailsPanel
                        selectedFunction={selectedFunction}
                        onCreateFunction={handleCreateFunction}
                        onRunFunction={handleRunFunction}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
}

export default function CloudFunctionsAntd() {
    return (
        <Provider store={store}>
            <CloudFunctionsAntdInner/>
        </Provider>
    );
}
