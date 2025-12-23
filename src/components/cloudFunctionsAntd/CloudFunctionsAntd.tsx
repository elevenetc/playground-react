"use client";

import { ReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import FunctionNode from './FunctionNode';
import { demoNodes, demoEdges } from './demoNodes';

const nodeTypes = {
    functionNode: FunctionNode,
};

export default function CloudFunctionsAntd() {
    return (
        <div className="fixed inset-0">
            {/* ReactFlow Background */}
            <div className="absolute inset-0 bg-gray-900">
                <ReactFlow
                    nodes={demoNodes}
                    edges={demoEdges}
                    nodeTypes={nodeTypes}
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
