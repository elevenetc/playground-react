"use client";

import {useCallback} from 'react';
import {addEdge, Connection, Edge, EdgeChange, Node, NodeChange, OnConnectStartParams, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import FunctionNode, {FunctionNodeData} from './FunctionNode';
import {CallController} from './CallController';
import {GraphState, HandleType} from './FunctionRunnerContext';
import {CallConnectionUtils} from './callConnectionUtils';
import {ConnectionStyles, defaultEdgeOptions, edgeStyle} from './connectionStyles';

const nodeTypes = {
    functionNode: FunctionNode,
};

type FunctionsFlowComponentProps = {
    nodes: Node<FunctionNodeData>[];
    edges: Edge[];
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    connectionController: CallController;
    setState: (state: GraphState) => void;
    setConnectingInfo: (info: {
        sourceFunctionId: string;
        sourceHandleId: string;
        handleType: HandleType
    } | null) => void;
    onPaneClick: () => void;
};

export default function FunctionsFlowComponent({
                                                   nodes,
                                                   edges,
                                                   setEdges,
                                                   onNodesChange,
                                                   onEdgesChange,
                                                   connectionController,
                                                   setState,
                                                   setConnectingInfo,
                                                   onPaneClick
                                               }: FunctionsFlowComponentProps) {

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target || !connection.targetHandle) {
                return;
            }

            const argumentIndex = CallConnectionUtils.parseInputIndex(connection.targetHandle);
            if (argumentIndex === null) {
                return;
            }

            const canConnect = connectionController.canBeConnected(
                connection.source,
                connection.target,
                argumentIndex
            );

            if (canConnect) {
                setEdges((eds) => addEdge(connection, eds));
            }
        },
        [connectionController, setEdges]
    );

    const onConnectStart = useCallback(
        (_: React.MouseEvent | React.TouchEvent, params: OnConnectStartParams) => {
            if (params.nodeId && params.handleId && params.handleType) {
                setState('connecting');
                setConnectingInfo({
                    sourceFunctionId: params.nodeId,
                    sourceHandleId: params.handleId,
                    handleType: params.handleType
                });
            }
        },
        [setState, setConnectingInfo]
    );

    const onConnectEnd = useCallback(
        () => {
            setState('idle');
            setConnectingInfo(null);
        },
        [setState, setConnectingInfo]
    );

    return (
        <div style={{width: '100%', height: '100%'}}>
            <style>{`
                .react-flow__edge.selected .react-flow__edge-path {
                    stroke: ${ConnectionStyles.selected.color} !important;
                    stroke-width: ${edgeStyle.strokeWidth} !important;
                }
            `}</style>
            <svg style={{position: 'absolute', width: 0, height: 0}}>
                <defs>
                    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={ConnectionStyles.output.color}/>
                        <stop offset="100%" stopColor={ConnectionStyles.input.color}/>
                    </linearGradient>
                </defs>
            </svg>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionLineStyle={edgeStyle}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onPaneClick={onPaneClick}
                fitView
                fitViewOptions={{padding: 0.2}}
                nodesDraggable={true}
                edgesUpdatable={true}
                edgesFocusable={true}
                elementsSelectable={true}
            />
        </div>
    );
}
