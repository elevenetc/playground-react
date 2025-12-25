import * as styles from './FunctionContainer.css';
import {useProject} from '../cloudFunctionsAntd/FunctionRunnerContext';
import {CallConnectionUtils} from '../cloudFunctionsAntd/callConnectionUtils';

export const PARAMETER_LINE_HEIGHT = 20; // Matches kotlinCode lineHeight: 1.25rem (20px)
export const SIGNATURE_FIRST_LINE_HEIGHT = 43;

type FunctionSignatureProps = {
    functionName: string;
    parameters: Record<string, string>;
    returnType?: string;
    functionId?: string;
};

export default function FunctionSignatureComponent({
                                                       functionName,
                                                       parameters,
                                                       returnType,
                                                       functionId
                                                   }: FunctionSignatureProps) {
    const graphContext = useProject();
    const paramEntries = Object.entries(parameters);

    // Check if a parameter at given index can accept the current connection
    const canParameterConnect = (parameterIndex: number, parameterType: string): boolean => {
        if (!graphContext || !functionId || graphContext.state !== 'connecting' || !graphContext.connectingInfo) {
            return true; // Not connecting, show normal
        }

        const {sourceFunctionId, handleType} = graphContext.connectingInfo;

        if (handleType === 'source') {
            // Dragging from output -> check if this parameter can accept it
            return graphContext.connectionController.canBeConnected(
                sourceFunctionId,
                functionId,
                parameterIndex
            );
        } else {
            // Dragging from input -> dim all parameters (looking for outputs, not inputs)
            return false;
        }
    };

    // Check if the return type can accept the current connection
    const canReturnTypeConnect = (): boolean => {
        if (!graphContext || !functionId || graphContext.state !== 'connecting' || !graphContext.connectingInfo) {
            return true; // Not connecting, show normal
        }

        const {sourceFunctionId, sourceHandleId, handleType} = graphContext.connectingInfo;

        if (handleType === 'target') {
            // Dragging from input -> check if this function's output can connect to it
            if (!returnType || returnType === 'Unit') {
                return false; // No output to connect
            }

            const argumentIndex = CallConnectionUtils.parseInputIndex(sourceHandleId);
            if (argumentIndex === null) return false;

            return graphContext.connectionController.canBeConnected(
                functionId,
                sourceFunctionId,
                argumentIndex
            );
        } else {
            // Dragging from output -> dim all return types (looking for inputs, not outputs)
            return false;
        }
    };

    const isConnecting = graphContext?.state === 'connecting';
    const isSourceNode = functionId === graphContext?.connectingInfo?.sourceFunctionId;

    return (
        <pre className={styles.kotlinCode}>
            <span style={{color: '#569cd6'}}>fun</span> {functionName}(
            {paramEntries.length > 0 && (
                <>
                    {'\n'}
                    {paramEntries.map(([name, type], index) => {
                        const canConnect = canParameterConnect(index, type);
                        const shouldHighlight = isConnecting && !isSourceNode && canConnect;
                        const shouldDim = isConnecting && !isSourceNode && !canConnect;

                        return (
                            <span key={name}>
                                {'   '}
                                <span
                                    style={{
                                        backgroundColor: shouldHighlight ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                                        transition: 'background-color 0.2s, opacity 0.2s',
                                        borderRadius: '4px',
                                        padding: '0px 4px'
                                    }}
                                >
                                    <span style={{
                                        color: '#ce9178',
                                        opacity: shouldDim ? 0.3 : 1
                                    }}>{name}</span>
                                    {': '}
                                    <span style={{
                                        color: '#4ec9b0',
                                        opacity: shouldDim ? 0.3 : 1
                                    }}>{type}</span>
                                </span>
                                {index < paramEntries.length - 1 && ','}
                                {'\n'}
                            </span>
                        );
                    })}
                </>
            )}
            ){returnType ? (
            <>
                {': '}
                <span style={{
                    color: '#4ec9b0',
                    backgroundColor: isConnecting && !isSourceNode && canReturnTypeConnect() ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                    opacity: isConnecting && !isSourceNode && !canReturnTypeConnect() ? 0.3 : 1,
                    transition: 'background-color 0.2s, opacity 0.2s',
                    borderRadius: '4px',
                    padding: '0px 4px'
                }}>{returnType}</span>
            </>
        ) : null}
        </pre>
    );
}
