"use client";

import {useEffect, useState} from 'react';
import {Node, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import FunctionNode, {FunctionNodeData} from './FunctionNode';
import {demoEdges, demoGraph, demoNodes} from './demoNodes';
import {FakeFunctionRunner} from './FakeFunctionRunner';
import {FunctionRunnerContext} from './FunctionRunnerContext';
import {FunctionData} from './FunctionData';

const nodeTypes = {
    functionNode: FunctionNode,
};

export default function CloudFunctionsAntd() {
    const [nodes, setNodes] = useState<Node<FunctionNodeData>[]>(demoNodes);
    const [runner] = useState(() => new FakeFunctionRunner(demoGraph));

    useEffect(() => {
        runner.subscribeOnFunctionStateChange((event) => {
            setNodes((prevNodes) =>
                prevNodes.map((node) => {
                    if (node.id === event.functionId) {
                        const func = demoGraph.getFunction(event.functionId);
                        if (func) {
                            // Create new FunctionData instance with updated state
                            const updatedFunc = new FunctionData(
                                func.id,
                                func.name,
                                func.returnType,
                                func.arguments,
                                func.sourceCode,
                                event.newState
                            );
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    functionData: updatedFunc,
                                },
                            };
                        }
                    }
                    return node;
                })
            );
        });
    }, [runner]);

    const handleRunFunction = (functionId: string) => {
        runner.run(functionId);
    };

    return (
        <FunctionRunnerContext.Provider value={{runFunction: handleRunFunction}}>
            <div className="fixed inset-0">
                {/* ReactFlow Background */}
                <div className="absolute inset-0 bg-gray-900">
                    <ReactFlow
                        nodes={nodes}
                        edges={demoEdges}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{padding: 0.2}}
                    />
                </div>

                {/* Left Panel */}
                <div className="absolute top-2 left-2 bottom-2 w-[250px]">
                    <LeftPanel/>
                </div>

                {/* Right Panel */}
                <div className="absolute top-2 right-2 bottom-2 w-[250px]">
                    <RightPanel/>
                </div>
            </div>
        </FunctionRunnerContext.Provider>
    );
}
