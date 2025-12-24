import {MarkerType} from 'reactflow';

/**
 * Centralized styling constants for ReactFlow connections (edges and handles)
 */
export const ConnectionStyles = {
    input: {
        color: '#d66666',
    },
    output: {
        color: '#2a79b6',
    },
    selected: {
        color: '#ffffff',
    }
} as const;

export const edgeStyle = {
    strokeWidth: 1,
    stroke: 'url(#edge-gradient)',
};

export const defaultEdgeOptions = {
    type: 'default',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: ConnectionStyles.input.color,
    },
    style: edgeStyle,
};
