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
    const [selectedFunction, setSelectedFunction] = useState<FunctionData | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        runner.subscribeOnFunctionStateChange((event) => {
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
                    setIsRunning(hasRunningFunction);

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

    const handleSelectFunction = (functionData: FunctionData) => {
        setSelectedFunction(functionData);
    };

    const handlePaneClick = () => {
        setSelectedFunction(null);
    };

    return (
        <FunctionRunnerContext.Provider value={{
            runFunction: handleRunFunction,
            selectFunction: handleSelectFunction,
            selectedFunctionId: selectedFunction?.id ?? null,
            isRunning
        }}>
            <div className="fixed inset-0">
                {/* ReactFlow Background */}
                <div className="absolute inset-0 bg-gray-900">
                    <ReactFlow
                        nodes={nodes}
                        edges={demoEdges}
                        nodeTypes={nodeTypes}
                        onPaneClick={handlePaneClick}
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
                    <RightPanel selectedFunction={selectedFunction}/>
                </div>
            </div>
        </FunctionRunnerContext.Provider>
    );
}
