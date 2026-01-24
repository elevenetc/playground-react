"use client";

import {useCallback, useEffect, useState} from 'react';
import {applyNodeChanges, Node, NodeChange} from 'reactflow';
import {ConfigProvider, theme} from 'antd';
import NamespacesPanel from './NamespacesPanel';
import DetailsPanel from './DetailsPanel';
import MenuPanel from './MenuPanel';
import {FunctionNodeData} from './FunctionNode';
import FunctionsFlowComponent from './FunctionsFlowComponent';
import {api} from './api/FakeCloudKotlinFunctionsApi';
import {useStore} from './state/store';
import {subscribeToFunctionEvents} from './state/subscribeToFunctionEvents';
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
        getEdges,
        runFunction
    } = useStore();

    const functions = getSelectedNamespaceFunctionsArray();
    const edges = getEdges();

    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // Load initial data from API
    useEffect(() => {
        const namespaceDtos = api.getNamespaces();
        if (namespaceDtos.length > 0) {
            const namespaces = namespaceDtos.map(dtoToNamespace);
            upsertNamespaces(namespaces);
        }
    }, [upsertNamespaces]);

    // Subscribe to function events when namespace changes
    useEffect(() => {
        if (selectedNamespaceId) {
            subscribeToFunctionEvents(api, selectedNamespaceId);
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
