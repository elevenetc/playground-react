"use client";

import {memo} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import FunctionContainer from '../functionContainer/FunctionContainer';
import {FunctionData} from './FunctionData';

export type FunctionNodeData = {
    functionData: FunctionData;
};

function FunctionNode({ data }: NodeProps<FunctionNodeData>) {
    const argumentCount = data.functionData.arguments.size;
    const hasReturnValue = data.functionData.returnType !== 'Unit';

    // Calculate vertical positions for argument handles
    const getArgumentHandlePosition = (index: number, total: number) => {
        if (total === 1) return '50%';
        return `${(100 / (total + 1)) * (index + 1)}%`;
    };

    return (
        <>
            {/* Left side - input handles (one per argument) */}
            {argumentCount > 0 && (
                <>
                    {Array.from({length: argumentCount}, (_, index) => (
                        <Handle
                            key={`input-${index}`}
                            type="target"
                            position={Position.Left}
                            id={`input-${index}`}
                            style={{top: getArgumentHandlePosition(index, argumentCount)}}
                        />
                    ))}
                </>
            )}

            <FunctionContainer
                functionData={data.functionData}
                functionId={data.functionData.id}
            />

            {/* Right side - output handle (for return value) */}
            {hasReturnValue && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    style={{top: '50%'}}
                />
            )}
        </>
    );
}

export default memo(FunctionNode);
