"use client";

import { ReactFlow, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Start Function' },
        position: { x: 250, y: 50 },
    },
    {
        id: '2',
        data: { label: 'Process Data' },
        position: { x: 250, y: 150 },
    },
    {
        id: '3',
        data: { label: 'Validate Input' },
        position: { x: 100, y: 250 },
    },
    {
        id: '4',
        data: { label: 'Transform' },
        position: { x: 400, y: 250 },
    },
    {
        id: '5',
        type: 'output',
        data: { label: 'End Function' },
        position: { x: 250, y: 350 },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-5', source: '3', target: '5' },
    { id: 'e4-5', source: '4', target: '5' },
];

export default function CloudFunctionsAntd() {
    return (
        <div className="fixed inset-0">
            {/* ReactFlow Background */}
            <div className="absolute inset-0 bg-gray-900">
                <ReactFlow
                    nodes={initialNodes}
                    edges={initialEdges}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                />
            </div>

            {/* Left Panel */}
            <div className="absolute top-2 left-2 bottom-2 w-[250px]">
                <LeftPanel />
            </div>

            {/* Right Panel */}
            <div className="absolute top-2 right-2 bottom-2 w-[250px]">
                <RightPanel />
            </div>
        </div>
    );
}
