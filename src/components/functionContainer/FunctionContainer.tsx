"use client";

import {assignInlineVars} from '@vanilla-extract/dynamic';
import * as styles from './FunctionContainer.css';
import {cssDebugValues, cssValues, DEBUG_CSS} from './FunctionContainer.css';
import {FunctionData} from '../cloudFunctionsAntd/FunctionData';
import {useFunctionCallGraph} from '../cloudFunctionsAntd/FunctionRunnerContext';
import FunctionSignatureComponent from './FunctionSignatureComponent';
import {CallConnectionUtils} from '../cloudFunctionsAntd/callConnectionUtils';
import {Button} from "antd";

const MAX_WIDTH = 300;
const MAX_HEIGHT = 250;

const getDebugColor = (key: keyof typeof cssValues) =>
    DEBUG_CSS ? cssDebugValues[key] : cssValues[key];

type FunctionContainerProps = {
    functionData?: FunctionData;
    functionId?: string;
    onClick?: () => void;
};

export default function FunctionContainer({functionData, functionId, onClick}: FunctionContainerProps) {
    const graphContext = useFunctionCallGraph();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (graphContext && functionData) {
            graphContext.selectFunction(functionData);
        }
        onClick?.();
    };

    const handleRunClick = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (functionId && graphContext) {
            graphContext.runFunction(functionId);
        }
    };

    const defaultData = new FunctionData('default', 'calculateSum', [['a', 'Int'], ['b', 'Int']], 'Int', 'fun calculateSum(a: Int, b: Int): Int { return a + b }');

    const data = functionData || defaultData;
    const isSelected = graphContext?.selectedFunctionId === functionId;
    const isRunning = graphContext?.state === 'running';

    const canBeConnected = () => {
        if (!graphContext || !functionId || graphContext.state !== 'connecting' || !graphContext.connectingInfo) {
            return true;
        }

        const {sourceFunctionId, sourceHandleId, handleType} = graphContext.connectingInfo;

        if (handleType === 'source') {
            // Dragging from output -> check if any input can accept it
            const argumentCount = data.arguments.size;
            for (let i = 0; i < argumentCount; i++) {
                if (graphContext.connectionController.canBeConnected(sourceFunctionId, functionId, i)) {
                    return true;
                }
            }
            return false;
        } else {
            // Dragging from input -> check if this function's output can connect to it
            if (data.returnType === 'Unit') {
                return false; // No output to connect
            }

            const argumentIndex = CallConnectionUtils.parseInputIndex(sourceHandleId);
            if (argumentIndex === null) return false;

            return graphContext.connectionController.canBeConnected(
                functionId,
                sourceFunctionId,
                argumentIndex
            );
        }
    };

    const isSourceNode = functionId === graphContext?.connectingInfo?.sourceFunctionId;
    const shouldDim = graphContext?.state === 'connecting' && !isSourceNode && !canBeConnected();

    const getBorderStyle = () => {
        if (isSelected) {
            return {
                border: '1px solid #FF0000',
            };
        }
        if (isRunning) {
            return {
                border: '1px solid #00FF00',
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
                parameters={data.getArgumentsAsRecord()}
                returnType={data.returnType}
                functionId={functionId}
            />
        </div>
        <div id="statusAndRun" className={styles.statusAndRun}>
            <Button
                size="small"
                type="text"
                style={{flex: "auto", height: "2rem", borderRadius: '0 0 0.375rem 0.375rem'}}
                disabled={data.state !== 'idle' || isRunning}
                onClick={handleRunClick}>
                {data.state === 'idle' && 'Run'}
                {data.state === 'running' && 'Running...'}
                {data.state === 'building' && 'Building...'}
                {data.state === 'build-error' && 'Build Error'}
            </Button>
        </div>
    </div>;
}
