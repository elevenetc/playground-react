"use client";

import {useCallback, useEffect, useState} from 'react';
import {applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange} from 'reactflow';
import {ConfigProvider, theme} from 'antd';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import {FunctionNodeData} from './FunctionNode';
import {demoEdges, demoGraph, demoNodes} from './demoNodes';
import {FakeFunctionRunner} from './FakeFunctionRunner';
import {GraphState, HandleType, ProjectContext} from './FunctionRunnerContext';
import {Function} from './Function';
import {CallController} from './CallController';
import FunctionsFlowComponent from './FunctionsFlowComponent';

export default function CloudFunctionsAntd() {
    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>(demoNodes);
    const [edges, setEdges] = useState<Edge[]>(demoEdges);
    const [runner] = useState(() => new FakeFunctionRunner(demoGraph));
    const [selectedFunction, setSelectedFunction] = useState<Function | null>(null);
    const [state, setState] = useState<GraphState>('idle');
    const [connectionController] = useState(() => new CallController(demoGraph));
    const [connectingInfo, setConnectingInfo] = useState<{
        sourceFunctionId: string;
        sourceHandleId: string;
        handleType: HandleType;
    } | null>(null);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    useEffect(() => {
        runner.subscribeOnFunctionStateChange((event) => {
            const func = demoGraph.getFunction(event.functionId);
            if (func) {
                // Create new Function instance with updated state
                const updatedFunc = new Function(func.id, func.name, func.arguments, func.returnType, func.sourceCode, event.newState);

                // Update nodes
                setNodes((prevNodes) => {
                    const newNodes = prevNodes.map((node) => {
                        if (node.id === event.functionId) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    functionData: updatedFunc,
                                },
                            };
                        }
                        return node;
                    });

                    // Check if any function is running
                    const hasRunningFunction = newNodes.some(
                        node => node.data.functionData.state === 'running'
                    );
                    setState(hasRunningFunction ? 'running' : 'idle');

                    return newNodes;
                });

                // Update selected function if it's the one that changed
                setSelectedFunction((prev) => {
                    if (prev && prev.id === event.functionId) {
                        return updatedFunc;
                    }
                    return prev;
                });
            }
        });
    }, [runner]);

    const handleRunFunction = (functionId: string) => {
        runner.run(functionId);
    };

    const handleSelectFunction = (functionData: Function) => {
        setSelectedFunction(functionData);
    };

    const handlePaneClick = () => {
        setSelectedFunction(null);
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
            }}
        >
            <ProjectContext.Provider value={{
                runFunction: handleRunFunction,
                selectFunction: handleSelectFunction,
                selectedFunctionId: selectedFunction?.id ?? null,
                state,
                connectionController,
                connectingInfo
            }}>
                <div className="fixed inset-0">
                    {/* ReactFlow Background */}
                    <div className="absolute inset-0 bg-gray-900">
                        <FunctionsFlowComponent
                            nodes={nodes}
                            edges={edges}
                            setEdges={setEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            connectionController={connectionController}
                            setState={setState}
                            setConnectingInfo={setConnectingInfo}
                            onPaneClick={handlePaneClick}
                        />
                    </div>

                    {/* Left Panel */}
                    <div className="absolute top-2 left-2 bottom-2 w-[250px]">
                        <LeftPanel/>
                    </div>

                    {/* Right Panel */}
                    <div className="absolute top-2 right-2 bottom-2 w-[250px]">
                        <RightPanel selectedFunction={selectedFunction}/>
                    </div>
                </div>
            </ProjectContext.Provider>
        </ConfigProvider>
    );
}
