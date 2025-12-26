"use client";

import {useCallback, useEffect, useState} from 'react';
import {applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange} from 'reactflow';
import {ConfigProvider, theme} from 'antd';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import {FunctionNodeData} from './FunctionNode';
import {GraphState, HandleType, ProjectContext} from './FunctionRunnerContext';
import {Function, FunctionState} from './Function';
import {CallController} from './CallController';
import FunctionsFlowComponent from './FunctionsFlowComponent';
import {FakeCloudKotlinFunctionsApi} from './api/FakeCloudKotlinFunctionsApi';
import {FunctionDto} from './api/CloudKotlinFunctionsApi';
import {Project} from './Project';

const dtoToFunction = (dto: FunctionDto): Function => {
    const args: [string, string][] = dto.arguments.map(arg => [
        arg.name,
        arg.type.name + (arg.nullable ? '?' : '')
    ]);

    const returnType = dto.returnType.name + (dto.returnType.nullable ? '?' : '');

    return new Function(
        dto.id,
        dto.name,
        args,
        returnType,
        dto.sourceCode,
        dto.state as FunctionState
    );
};

export default function CloudFunctionsAntd() {
    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [api] = useState(() => new FakeCloudKotlinFunctionsApi());
    const [project] = useState(() => new Project());
    const [selectedFunction, setSelectedFunction] = useState<Function | null>(null);
    const [state, setState] = useState<GraphState>('idle');
    const [connectionController] = useState(() => new CallController(project));
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
        const projects = api.getProjects();
        if (projects.length > 0) {
            const projectDto = projects[0];

            projectDto.functions.forEach(funcDto => {
                const func = dtoToFunction(funcDto);
                project.addFunction(func);
            });

            projectDto.connections.forEach(connDto => {
                project.addConnection(connDto.outFunctionId, connDto.inputArgumentId);
            });

            const initialNodes: Node<FunctionNodeData>[] = projectDto.functions.map((funcDto, index) => ({
                id: funcDto.id,
                type: 'functionNode',
                data: {functionData: dtoToFunction(funcDto)},
                position: {x: 50 + index * 350, y: 250},
            }));

            const initialEdges: Edge[] = projectDto.connections.map((conn) => ({
                id: `e-${conn.outFunctionId}-${conn.inputArgumentId}`,
                source: conn.outFunctionId,
                target: conn.inputArgumentId,
                sourceHandle: 'output',
                targetHandle: '0',
            }));

            setNodes(initialNodes);
            setEdges(initialEdges);
        }

        api.subscribeToFunctionEvents((_eventId, eventType, functionDto, error) => {
            if (error) {
                console.error('Function error:', error);
                return;
            }

            const func = dtoToFunction(functionDto);

            if (eventType === 'created') {
                // Add new function to project
                project.addFunction(func);

                // Add new function node
                setNodes((prevNodes) => {
                    const newNode: Node<FunctionNodeData> = {
                        id: functionDto.id,
                        type: 'functionNode',
                        data: {functionData: func},
                        position: {x: 100 + prevNodes.length * 350, y: 250},
                    };
                    return [...prevNodes, newNode];
                });
            } else if (eventType === 'state-changed') {
                // Update function state in project
                const existingFunc = project.getFunction(functionDto.id);
                if (existingFunc) {
                    existingFunc.state = func.state;
                }

                // Update existing function state
                setNodes((prevNodes) => {
                    const newNodes = prevNodes.map((node) => {
                        if (node.id === functionDto.id) {
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

                    const hasRunningFunction = newNodes.some(
                        node => node.data.functionData.state === 'running'
                    );
                    setState(hasRunningFunction ? 'running' : 'idle');

                    return newNodes;
                });
            } else if (eventType === 'deleted') {
                // Remove function from project
                project.removeFunction(functionDto.id);

                // Remove function node
                setNodes((prevNodes) => prevNodes.filter(node => node.id !== functionDto.id));
            }

            setSelectedFunction((prev) => {
                if (prev && prev.id === functionDto.id) {
                    return func;
                }
                return prev;
            });
        });
    }, [api, project]);

    const handleRunFunction = (functionId: string) => {
        api.runFunction(functionId);
    };

    const handleSelectFunction = (functionData: Function) => {
        setSelectedFunction(functionData);
    };

    const handleCreateFunction = (sourceCode: string) => {
        api.createFunction(sourceCode);
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
                        <RightPanel
                            selectedFunction={selectedFunction}
                            onCreateFunction={handleCreateFunction}
                        />
                    </div>
                </div>
            </ProjectContext.Provider>
        </ConfigProvider>
    );
}
