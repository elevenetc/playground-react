"use client";

import {memo} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import FunctionContainer from '../functionContainer/FunctionContainer';
import {FunctionData} from './FunctionData';
import {PARAMETER_LINE_HEIGHT, SIGNATURE_FIRST_LINE_HEIGHT} from '../functionContainer/FunctionSignatureComponent';

export type FunctionNodeData = {
    functionData: FunctionData;
};

function FunctionNode({ data }: NodeProps<FunctionNodeData>) {
    const argumentCount = data.functionData.arguments.size;
    const hasReturnValue = data.functionData.returnType !== 'Unit';

    // Calculate vertical positions for argument handles aligned with parameter rows
    const getArgumentHandlePosition = (index: number) => {
        // Position handle at center of parameter line
        // First line is "fun functionName(", then parameters start
        return SIGNATURE_FIRST_LINE_HEIGHT + (PARAMETER_LINE_HEIGHT * index) + (PARAMETER_LINE_HEIGHT / 2);
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
                            style={{top: `${getArgumentHandlePosition(index)}px`}}
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
