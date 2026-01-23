"use client";

import {useCallback} from 'react';
import {Connection, Edge, Node, NodeChange, OnConnectStartParams, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import FunctionNode, {FunctionNodeData} from './FunctionNode';
import {ConnectionType, NamespaceState} from './FunctionRunnerContext';
import {CallConnectionUtils} from './callConnectionUtils';
import {ConnectionStyles, defaultEdgeOptions, edgeStyle} from './connectionStyles';
import {useAppDispatch, useAppSelector} from './state/hooks';
import {Function} from './Function';
import {selectNamespaceIdByFunctionId, selectNamespaceState, selectSelectedNamespaceFunctions} from './state/selectors';
import {canBeConnected} from './canBeConnected';
import {connectionAdded} from './namespaces/namespacesSlice';
import {store} from './state/store';

const nodeTypes = {
    functionNode: FunctionNode,
};

type FunctionsFlowComponentProps = {
    nodes: Node<FunctionNodeData>[];
    edges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    setState: (state: NamespaceState) => void;
    setConnectingInfo: (info: {
        sourceFunctionId: string;
        sourceHandleId: string;
        connectionType: ConnectionType
    } | null) => void;
    onPaneClick: () => void;
};

export default function FunctionsFlowComponent({
                                                   nodes,
                                                   edges,
                                                   onNodesChange,
                                                   setState,
                                                   setConnectingInfo,
                                                   onPaneClick
                                               }: FunctionsFlowComponentProps) {
    const dispatch = useAppDispatch();
    const functions: Record<string, Function> = useAppSelector(selectSelectedNamespaceFunctions);
    const namespaceState = useAppSelector(selectNamespaceState);

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target || !connection.targetHandle) {
                return;
            }

            const argumentIndex = CallConnectionUtils.parseInputIndex(connection.targetHandle);
            if (argumentIndex === null) {
                return;
            }

            const canConnect = canBeConnected(
                functions,
                connection.source,
                connection.target,
                argumentIndex
            );

            if (canConnect) {
                // Find namespace for the target function
                const state = store.getState();
                const namespaceIdSelector = selectNamespaceIdByFunctionId(connection.target);
                const namespaceId = namespaceIdSelector(state);

                if (namespaceId) {
                    dispatch(connectionAdded({
                        namespaceId,
                        outFunctionId: connection.source,
                        targetFunctionId: connection.target,
                        targetArgIndex: argumentIndex
                    }));
                }
            }
        },
        [functions, dispatch]
    );

    const onConnectStart = useCallback(
        (_: React.MouseEvent | React.TouchEvent, params: OnConnectStartParams) => {
            if (params.nodeId && params.handleId && params.handleType) {
                setState('connecting');
                setConnectingInfo({
                    sourceFunctionId: params.nodeId,
                    sourceHandleId: params.handleId,
                    connectionType: params.handleType as ConnectionType
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
        <div style={{width: '100%', height: '100%'}}
             className={namespaceState === 'connecting' ? 'connecting-mode' : ''}>
            <style>{`
                .react-flow__edge.selected .react-flow__edge-path {
                    stroke: ${ConnectionStyles.selected.color} !important;
                    stroke-width: ${edgeStyle.strokeWidth} !important;
                }
                .connecting-mode .react-flow__edge .react-flow__edge-path {
                    opacity: 0.2;
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
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onPaneClick={onPaneClick}
                fitView
                fitViewOptions={{padding: 0.2}}
                nodesDraggable={true}
                elementsSelectable={true}
            />
        </div>
    );
}
