"use client";

import {assignInlineVars} from '@vanilla-extract/dynamic';
import * as styles from './FunctionContainer.css';
import {cssDebugValues, cssValues, DEBUG_CSS} from './FunctionContainer.css';
import Button from '../button/Button';
import {FunctionData} from '../cloudFunctionsAntd/FunctionData';
import {useFunctionRunner} from '../cloudFunctionsAntd/FunctionRunnerContext';

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
    const runner = useFunctionRunner();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (runner && functionData) {
            runner.selectFunction(functionData);
        }
        onClick?.();
    };

    const handleRunClick = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (functionId && runner) {
            runner.runFunction(functionId);
        }
    };

    const defaultData = new FunctionData(
        'default',
        'calculateSum',
        'Int',
        [['a', 'Int'], ['b', 'Int']],
        'fun calculateSum(a: Int, b: Int): Int { return a + b }'
    );

    const data = functionData || defaultData;
    const isSelected = runner?.selectedFunctionId === functionId;
    const isRunning = runner?.isRunning ?? false;

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
            ...getBorderStyle()
        }}
    >
        <div className={styles.codeAndMenu}>
            <div id="code" className={styles.code}>
                {getKotlinCode(data.name, data.getArgumentsAsRecord(), data.returnType)}
            </div>
            <div id="menu" className={styles.menu}>Menu</div>
        </div>
        <div id="statusAndRun" className={styles.statusAndRun}>
            <div className={styles.status}>
                {data.state === 'idle' && 'Ready'}
                {data.state === 'running' && 'Running...'}
                {data.state === 'building' && 'Building...'}
                {data.state === 'build-error' && 'Build Error'}
            </div>
            <Button disabled={data.state !== 'idle' || isRunning} onClick={handleRunClick}>Run</Button>
        </div>
    </div>;
}

function getKotlinCode(
    functionName: string,
    parameters: Record<string, string>,
    returnValue?: string
) {
    const paramEntries = Object.entries(parameters);

    return (
        <pre className={styles.kotlinCode}>
            <span style={{color: '#569cd6'}}>fun</span> {functionName}(
            {paramEntries.length > 0 && (
                <>
                    {'\n'}
                    {paramEntries.map(([name, type], index) => (
                        <span key={name}>
                            {'   '}
                            <span style={{color: '#ce9178'}}>{name}</span>
                            {': '}
                            <span style={{color: '#4ec9b0'}}>{type}</span>
                            {index < paramEntries.length - 1 && ','}
                            {'\n'}
                        </span>
                    ))}
                </>
            )}
            ){returnValue ? (
            <>
                {': '}
                <span style={{color: '#4ec9b0'}}>{returnValue}</span>
            </>
        ) : null}
        </pre>
    );
}

