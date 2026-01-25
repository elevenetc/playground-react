"use client";

import {useCallback, useEffect, useMemo, useState} from 'react';
import {applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange} from 'reactflow';
import {ConfigProvider, theme} from 'antd';
import NamespacesPanel from './NamespacesPanel';
import DetailsPanel from './DetailsPanel';
import MenuPanel from './MenuPanel';
import CallGroupPanel from './CallGroupPanel';
import {FunctionNodeData} from './FunctionNode';
import FunctionsFlowComponent from './FunctionsFlowComponent';
import {api} from './api/FakeCloudKotlinFunctionsApi';
import {useStore} from './state/store';
import {subscribeToEvents} from './state/subscribeToEvents';
import {dtoToNamespace} from './dto/dtoToNamespace';

export default function CloudFunctionsAntd() {
    const {
        selectedFunctionId,
        selectedNamespaceId,
        selectFunction,
        setNamespaceState,
        setConnectingInfo,
        upsertNamespaces,
        getSelectedNamespaceFunctionsArray,
        getSelectedNamespaceConnections,
        getEdges,
        runFunction,
        deleteFunction,
        removeConnection
    } = useStore();

    const functions = getSelectedNamespaceFunctionsArray();
    const connections = getSelectedNamespaceConnections();

    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // Memoize store edges to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps -- connections triggers recomputation
    const storeEdges = useMemo(() => getEdges(), [connections, getEdges]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            // Handle edge removals - sync to store
            changes.forEach(change => {
                if (change.type === 'remove' && selectedNamespaceId) {
                    // Parse edge ID: e::{outFunctionId}::{targetFunctionId}::{targetArgIndex}
                    const parts = change.id.split('::');
                    if (parts.length === 4) {
                        const outFunctionId = parts[1];
                        const targetFunctionId = parts[2];
                        const targetArgIndex = parseInt(parts[3], 10);
                        removeConnection(selectedNamespaceId, outFunctionId, targetFunctionId, targetArgIndex);
                    }
                }
            });
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        [selectedNamespaceId, removeConnection]
    );

    // Load initial data from API
    useEffect(() => {
        const namespaceDtos = api.getNamespaces();
        if (namespaceDtos.length > 0) {
            const namespaces = namespaceDtos.map(dtoToNamespace);
            upsertNamespaces(namespaces);
        }
    }, [upsertNamespaces]);

    // Subscribe to events when namespace changes
    useEffect(() => {
        if (selectedNamespaceId) {
            subscribeToEvents(api, selectedNamespaceId);
        }
    }, [selectedNamespaceId]);

    // Rebuild nodes when namespace changes
    useEffect(() => {
        const newNodes: Node<FunctionNodeData>[] = functions.map((func, index) => ({
            id: func.id,
            type: 'functionNode',
            data: {functionData: func},
            position: {x: 100 + index * 350, y: 250},
        }));
        setNodes(newNodes);
    }, [selectedNamespaceId, functions]);

    // Sync edges from store when connections change
    useEffect(() => {
        setEdges(storeEdges);
    }, [storeEdges]);

    const handleRunFunction = (functionId: string) => {
        runFunction(functionId);
    };

    const handleCreateFunction = (sourceCode: string) => {
        if (!selectedNamespaceId) {
            console.error('No namespace selected');
            return;
        }
        api.createFunction(selectedNamespaceId, sourceCode);
    };

    const handleDeleteFunction = (functionId: string) => {
        if (!selectedNamespaceId) {
            console.error('No namespace selected');
            return;
        }
        deleteFunction(selectedNamespaceId, functionId);
        api.deleteFunction(functionId);
        selectFunction(null);
    };

    const handlePaneClick = () => {
        selectFunction(null);
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
                        onEdgesChange={onEdgesChange}
                        setState={setNamespaceState}
                        setConnectingInfo={setConnectingInfo}
                        onPaneClick={handlePaneClick}
                    />
                </div>

                {/* Top Menu */}
                <div className="absolute top-2 left-[286px] right-[286px]">
                    <MenuPanel/>
                </div>

                {/* Left Panel */}
                <div className="absolute top-2 left-2 bottom-[170px] w-[270px]">
                    <NamespacesPanel/>
                </div>

                {/* Right Panel */}
                <div className="absolute top-2 right-2 bottom-[170px] w-[270px]">
                    <DetailsPanel
                        selectedFunction={selectedFunction}
                        onCreateFunction={handleCreateFunction}
                        onRunFunction={handleRunFunction}
                        onDeleteFunction={handleDeleteFunction}
                    />
                </div>

                {/* Bottom Panel */}
                <div className="absolute bottom-2 left-2 right-2 h-[150px]">
                    <CallGroupPanel/>
                </div>
            </div>
        </ConfigProvider>
    );
}
