"use client";

import {useCallback, useEffect, useState} from 'react';
import {applyNodeChanges, Node, NodeChange} from 'reactflow';
import {ConfigProvider, theme} from 'antd';
import {Provider} from 'react-redux';
import NamespacesPanel from './NamespacesPanel';
import DetailsPanel from './DetailsPanel';
import {FunctionNodeData} from './FunctionNode';
import {Function} from './Function';
import FunctionsFlowComponent from './FunctionsFlowComponent';
import {api} from './api/FakeCloudKotlinFunctionsApi';
import {useAppDispatch, useAppSelector} from './state/hooks';
import {
    selectConnectingInfo,
    selectEdges,
    selectFunctionsArray,
    selectProjectState,
    selectSelectedFunctionId,
    selectSelectedNamespaceId
} from './state/selectors';
import {connectingInfoSet, functionSelected, projectStateChanged} from './state/uiSlice';
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
    const projectState = useAppSelector(selectProjectState);
    const connectingInfo = useAppSelector(selectConnectingInfo);

    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // Load initial data and setup API event listener
    useEffect(() => {
        const namespaceDtos = api.getNamespaces();
        if (namespaceDtos.length > 0) {
            const namespaces = namespaceDtos.map(dtoToNamespace);
            dispatch(namespacesUpserted(namespaces));

            // Create initial nodes from all functions in all namespaces
            const initialNodes: Node<FunctionNodeData>[] = [];
            let nodeIndex = 0;
            namespaces.forEach(namespace => {
                namespace.functions.forEach(func => {
                    initialNodes.push({
                        id: func.id,
                        type: 'functionNode',
                        data: {functionData: func},
                        position: {x: 50 + nodeIndex * 350, y: 250},
                    });
                    nodeIndex++;
                });
            });

            setNodes(initialNodes);
        }

        if (selectedNamespaceId) {
            subscribeToFunctionEvents(api, dispatch, store.getState, selectedNamespaceId);
        }
    }, [dispatch, selectedNamespaceId]);

    // Sync nodes with Redux state and update project state
    useEffect(() => {
        setNodes((prevNodes) => {
            return prevNodes.map((node) => {
                const func = functions.find(f => f.id === node.id);
                if (func) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            functionData: func,
                        },
                    };
                }
                return node;
            });
        });

        // Update project state based on running functions (but don't override 'connecting' state)
        if (projectState !== 'connecting') {
            const hasRunningFunction = functions.some(f => f.state === 'running');
            const newState = hasRunningFunction ? 'running' : 'idle';
            if (projectState !== newState) {
                dispatch(projectStateChanged(newState));
            }
        }
    }, [functions, dispatch, projectState]);

    // Add/remove nodes when functions are created/deleted
    useEffect(() => {
        setNodes((prevNodes) => {
            const existingNodeIds = new Set(prevNodes.map(n => n.id));
            const functionIds = new Set(functions.map(f => f.id));

            // Add new nodes
            const newFunctions = functions.filter(f => !existingNodeIds.has(f.id));
            const newNodes = newFunctions.map((func, index) => ({
                id: func.id,
                type: 'functionNode' as const,
                data: {functionData: func},
                position: {x: 100 + (prevNodes.length + index) * 350, y: 250},
            }));

            // Remove deleted nodes
            const remainingNodes = prevNodes.filter(node => functionIds.has(node.id));

            return [...remainingNodes, ...newNodes];
        });
    }, [functions]);

    const handleRunFunction = (functionId: string) => {
        api.runFunction(functionId);
    };

    const handleSelectFunction = (functionData: Function) => {
        dispatch(functionSelected(functionData.id));
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

    const handleSetState = (newState: typeof projectState) => {
        dispatch(projectStateChanged(newState));
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
