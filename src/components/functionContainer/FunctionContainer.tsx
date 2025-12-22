"use client";

import {assignInlineVars} from '@vanilla-extract/dynamic';
import * as styles from './FunctionContainer.css';
import {cssDebugValues, cssValues, DEBUG_CSS} from './FunctionContainer.css';
import Button from '../button/Button';

const MAX_WIDTH = 300;
const MAX_HEIGHT = 250;

const getDebugColor = (key: keyof typeof cssValues) =>
    DEBUG_CSS ? cssDebugValues[key] : cssValues[key];

export default function FunctionContainer() {
    const handleClick = () => {
        console.log('FunctionContainer clicked!');
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
            maxHeight: MAX_HEIGHT
        }}
    >
        <div className={styles.codeAndMenu}>
            <div id="code" className={styles.code}>{getSum()}</div>
            <div id="menu" className={styles.menu}>Menu</div>
        </div>
        <div id="statusAndRun" className={styles.statusAndRun}>
            <div className={styles.status}>Ready</div>
            {/*<div className={styles.status}>Running...</div>*/}
            <Button disabled={false}>Run</Button>
        </div>
    </div>;
}

function getSum() {
    return <div>{getKotlinCode('calculateSum', {a: 'Int', b: 'Int'}, 'Int')}</div>
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

