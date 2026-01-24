"use client";

import {assignInlineVars} from '@vanilla-extract/dynamic';
import * as styles from './FunctionContainer.css';
import {cssDebugValues, cssValues, DEBUG_CSS} from './FunctionContainer.css';
import {Function} from '../cloudFunctionsAntd/Function';
import FunctionSignatureComponent from './FunctionSignatureComponent';
import {CallConnectionUtils} from '../cloudFunctionsAntd/callConnectionUtils';
import {Button} from "antd";
import {useStore} from '../cloudFunctionsAntd/state/store';
import {canBeConnected} from '../cloudFunctionsAntd/canBeConnected';

const MAX_WIDTH = 300;
const MAX_HEIGHT = 250;

const getDebugColor = (key: keyof typeof cssValues) =>
    DEBUG_CSS ? cssDebugValues[key] : cssValues[key];

type FunctionContainerProps = {
    functionData?: Function;
    functionId?: string;
    onClick: () => void;
    onRunFunction: (functionId: string) => void;
};

export default function FunctionContainer({functionData, functionId, onClick, onRunFunction}: FunctionContainerProps) {
    const {
        selectedFunctionId,
        namespaceState,
        connectingInfo,
        selectFunction,
        getSelectedNamespaceFunctions
    } = useStore();
    const functions = getSelectedNamespaceFunctions();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (functionData) {
            selectFunction(functionData.id);
        }
        onClick?.();
    };

    const handleRunClick = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (functionId && onRunFunction) {
            onRunFunction(functionId);
        }
    };

    const data = functionData!;
    const isSelected = selectedFunctionId === functionId;

    const canBeConnectedCheck = () => {
        if (!functionId || namespaceState !== 'connecting' || !connectingInfo) {
            return true;
        }

        const {sourceFunctionId, sourceHandleId, connectionType} = connectingInfo;

        if (connectionType === 'source') {
            const argumentCount = data.arguments.size;
            for (let i = 0; i < argumentCount; i++) {
                if (canBeConnected(functions, sourceFunctionId, functionId, i)) {
                    return true;
                }
            }
            return false;
        } else {
            if (data.returnType === 'Unit') {
                return false;
            }

            const argumentIndex = CallConnectionUtils.parseInputIndex(sourceHandleId);
            if (argumentIndex === null) return false;

            return canBeConnected(
                functions,
                functionId,
                sourceFunctionId,
                argumentIndex
            );
        }
    };

    const isSourceNode = functionId === connectingInfo?.sourceFunctionId;
    const shouldDim = namespaceState === 'connecting' && !isSourceNode && !canBeConnectedCheck();

    const getBorderStyle = () => {
        if (isSelected) {
            return {
                border: '1px solid #FF0000',
            };
        }
        return {
            border: 'none'
        };
    };

    return <div
        id="functionContainer"
        className={styles.functionContainer}
        onClick={handleClick}
        style={{
            ...assignInlineVars({
                [styles.functionContainerBg]: getDebugColor('functionContainerBg')
            }),
            maxWidth: MAX_WIDTH,
            maxHeight: MAX_HEIGHT,
            ...getBorderStyle(),
            opacity: shouldDim ? 0.3 : 1,
            transition: 'opacity 0.2s'
        }}
    >
        <div id="codeSignature" className={styles.codeSignature}>
            <FunctionSignatureComponent
                functionName={data.name}
                parameters={Object.fromEntries(data?.arguments)}
                returnType={data.returnType}
                functionId={functionId}
            />
        </div>
        <div id="statusAndRun" className={styles.statusAndRun}>
            <Button
                size="small"
                type="text"
                style={{flex: "auto", height: "2rem", borderRadius: '0 0 0.375rem 0.375rem'}}
                disabled={data.state !== 'idle'}
                onClick={handleRunClick}>
                {data.state === 'idle' && 'Run'}
                {data.state === 'running' && 'Running...'}
                {data.state === 'building' && 'Building...'}
                {data.state === 'build-error' && 'Build Error'}
            </Button>
        </div>
    </div>;
}
