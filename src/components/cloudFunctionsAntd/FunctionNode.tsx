"use client";

import {memo} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import FunctionContainer from '../functionContainer/FunctionContainer';
import {Function} from './Function';
import {PARAMETER_LINE_HEIGHT, SIGNATURE_FIRST_LINE_HEIGHT} from '../functionContainer/FunctionSignatureComponent';
import {CallConnectionUtils} from './callConnectionUtils';
import {ConnectionStyles} from './connectionStyles';
import {useStore} from './state/store';
import {canBeConnected} from './canBeConnected';

export type FunctionNodeData = {
    functionData: Function;
};

function FunctionNode({data}: NodeProps<FunctionNodeData>) {
    const {namespaceState, connectingInfo, getSelectedNamespaceFunctions} = useStore();
    const functions = getSelectedNamespaceFunctions();

    const argumentCount = data.functionData.arguments.size;
    const hasReturnValue = data.functionData.returnType !== 'Unit';
    const isSourceNode = data.functionData.id === connectingInfo?.sourceFunctionId;

    const getArgumentHandlePosition = (index: number) => {
        return SIGNATURE_FIRST_LINE_HEIGHT + (PARAMETER_LINE_HEIGHT * index) + (PARAMETER_LINE_HEIGHT / 2);
    };

    const canInputHandleConnect = (argumentIndex: number): boolean => {
        if (namespaceState !== 'connecting' || !connectingInfo) {
            return true;
        }

        const {sourceFunctionId, connectionType} = connectingInfo;

        if (connectionType === 'source') {
            return canBeConnected(
                functions,
                sourceFunctionId,
                data.functionData.id,
                argumentIndex
            );
        } else {
            return false;
        }
    };

    const canOutputHandleConnect = (): boolean => {
        if (namespaceState !== 'connecting' || !connectingInfo) {
            return true;
        }

        const {sourceFunctionId, sourceHandleId, connectionType} = connectingInfo;

        if (connectionType === 'target') {
            const argumentIndex = CallConnectionUtils.parseInputIndex(sourceHandleId);
            if (argumentIndex === null) return false;

            return canBeConnected(
                functions,
                data.functionData.id,
                sourceFunctionId,
                argumentIndex
            );
        } else {
            return false;
        }
    };

    const getInputHandleStyle = (argumentIndex: number) => {
        const baseStyle = {
            top: `${getArgumentHandlePosition(argumentIndex)}px`,
            left: '13.5px',
            background: ConnectionStyles.input.color,
            borderColor: ConnectionStyles.input.color
        };

        if (namespaceState === 'connecting' && !isSourceNode && !canInputHandleConnect(argumentIndex)) {
            return {
                ...baseStyle,
                opacity: 0.2,
                pointerEvents: 'none' as const
            };
        }

        return baseStyle;
    };

    const getOutputHandlePosition = () => {
        if (argumentCount === 0) {
            return SIGNATURE_FIRST_LINE_HEIGHT / 1.3;
        } else {
            return SIGNATURE_FIRST_LINE_HEIGHT + (PARAMETER_LINE_HEIGHT * argumentCount) + (PARAMETER_LINE_HEIGHT / 2);
        }
    };

    const getOutputHandleStyle = () => {
        const baseStyle = {
            top: `${getOutputHandlePosition()}px`,
            right: '13px',
            background: ConnectionStyles.output.color,
            borderColor: ConnectionStyles.output.color
        };

        if (namespaceState === 'connecting' && !isSourceNode && !canOutputHandleConnect()) {
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
