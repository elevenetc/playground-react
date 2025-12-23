"use client";

import {useCallback} from 'react';
import {addEdge, Connection, Edge, EdgeChange, Node, NodeChange, OnConnectStartParams, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import FunctionNode, {FunctionNodeData} from './FunctionNode';
import {ConnectionController} from './ConnectionController';
import {GraphState} from './FunctionRunnerContext';

const nodeTypes = {
    functionNode: FunctionNode,
};

type FunctionsFlowComponentProps = {
    nodes: Node<FunctionNodeData>[];
    edges: Edge[];
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    connectionController: ConnectionController;
    setState: (state: GraphState) => void;
    setConnectingInfo: (info: { sourceFunctionId: string; sourceHandleId: string } | null) => void;
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

            const targetHandleMatch = connection.targetHandle.match(/^input-(\d+)$/);
            if (!targetHandleMatch) {
                return;
            }

            const argumentIndex = parseInt(targetHandleMatch[1], 10);
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
            if (params.nodeId && params.handleId && params.handleType === 'source') {
                setState('connecting');
                setConnectingInfo({
                    sourceFunctionId: params.nodeId,
                    sourceHandleId: params.handleId
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
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
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
    );
}
