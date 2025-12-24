"use client";

import {memo} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import FunctionContainer from '../functionContainer/FunctionContainer';
import {FunctionData} from './FunctionData';
import {PARAMETER_LINE_HEIGHT, SIGNATURE_FIRST_LINE_HEIGHT} from '../functionContainer/FunctionSignatureComponent';
import {useFunctionCallGraph} from './FunctionRunnerContext';
import {CallConnectionUtils} from './callConnectionUtils';
import {ConnectionStyles} from './connectionStyles';

export type FunctionNodeData = {
    functionData: FunctionData;
};

function FunctionNode({ data }: NodeProps<FunctionNodeData>) {
    const graphContext = useFunctionCallGraph();
    const argumentCount = data.functionData.arguments.size;
    const hasReturnValue = data.functionData.returnType !== 'Unit';
    const isSourceNode = data.functionData.id === graphContext?.connectingInfo?.sourceFunctionId;

    // Calculate vertical positions for argument handles aligned with parameter rows
    const getArgumentHandlePosition = (index: number) => {
        // Position handle at center of parameter line
        // First line is "fun functionName(", then parameters start
        return SIGNATURE_FIRST_LINE_HEIGHT + (PARAMETER_LINE_HEIGHT * index) + (PARAMETER_LINE_HEIGHT / 2);
    };

    // Check if a specific input handle can accept the current connection
    const canInputHandleConnect = (argumentIndex: number): boolean => {
        if (!graphContext || graphContext.state !== 'connecting' || !graphContext.connectingInfo) {
            return true; // Show all handles when not connecting
        }

        const {sourceFunctionId, handleType} = graphContext.connectingInfo;

        if (handleType === 'source') {
            // Dragging from output -> check if this input can accept it
            return graphContext.connectionController.canBeConnected(
                sourceFunctionId,
                data.functionData.id,
                argumentIndex
            );
        } else {
            // Dragging from input -> dim all other inputs
            return false;
        }
    };

    // Check if output handle can accept the current connection
    const canOutputHandleConnect = (): boolean => {
        if (!graphContext || graphContext.state !== 'connecting' || !graphContext.connectingInfo) {
            return true; // Show handle when not connecting
        }

        const {sourceFunctionId, sourceHandleId, handleType} = graphContext.connectingInfo;

        if (handleType === 'target') {
            // Dragging from input -> check if this output can connect to it
            const argumentIndex = CallConnectionUtils.parseInputIndex(sourceHandleId);
            if (argumentIndex === null) return false;

            return graphContext.connectionController.canBeConnected(
                data.functionData.id,
                sourceFunctionId,
                argumentIndex
            );
        } else {
            // Dragging from output -> dim all other outputs
            return false;
        }
    };

    // Get style for input handle based on connection compatibility
    const getInputHandleStyle = (argumentIndex: number) => {
        const baseStyle = {
            top: `${getArgumentHandlePosition(argumentIndex)}px`,
            left: '13.5px',
            background: ConnectionStyles.input.color,
            borderColor: ConnectionStyles.input.color
        };

        if (graphContext?.state === 'connecting' && !isSourceNode && !canInputHandleConnect(argumentIndex)) {
            return {
                ...baseStyle,
                opacity: 0.2,
                pointerEvents: 'none' as const
            };
        }

        return baseStyle;
    };

    // Calculate vertical position for output handle aligned with return type
    const getOutputHandlePosition = () => {
        if (argumentCount === 0) {
            return SIGNATURE_FIRST_LINE_HEIGHT / 1.3;
        } else {
            return SIGNATURE_FIRST_LINE_HEIGHT + (PARAMETER_LINE_HEIGHT * argumentCount) + (PARAMETER_LINE_HEIGHT / 2);
        }
    };

    // Get style for output handle based on connection compatibility
    const getOutputHandleStyle = () => {
        const baseStyle = {
            top: `${getOutputHandlePosition()}px`,
            right: '13px',
            background: ConnectionStyles.output.color,
            borderColor: ConnectionStyles.output.color
        };

        if (graphContext?.state === 'connecting' && !isSourceNode && !canOutputHandleConnect()) {
            return {
                ...baseStyle,
                opacity: 0.2,
                pointerEvents: 'none' as const
            };
        }

        return baseStyle;
    };

    return (
        <>
            {/* Left side - input handles (one per argument) */}
            {argumentCount > 0 && (
                <>
                    {Array.from({length: argumentCount}, (_, index) => {
                        const handleId = CallConnectionUtils.createInputId(index);
                        return (
                            <Handle
                                key={handleId}
                                type="target"
                                position={Position.Left}
                                id={handleId}
                                style={getInputHandleStyle(index)}
                            />
                        );
                    })}
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
                    id={CallConnectionUtils.createOutputId()}
                    style={getOutputHandleStyle()}
                />
            )}
        </>
    );
}

export default memo(FunctionNode);
