import * as styles from './FunctionContainer.css';
import {CallConnectionUtils} from '../cloudFunctionsAntd/callConnectionUtils';
import {useStore} from '../cloudFunctionsAntd/state/store';
import {canBeConnected} from '../cloudFunctionsAntd/canBeConnected';

export const PARAMETER_LINE_HEIGHT = 20;
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
    const {namespaceState, connectingInfo, getSelectedNamespaceFunctions} = useStore();
    const functions = getSelectedNamespaceFunctions();
    const paramEntries = Object.entries(parameters);

    const canParameterConnect = (parameterIndex: number): boolean => {
        if (!functionId || namespaceState !== 'connecting' || !connectingInfo) {
            return true;
        }

        const {sourceFunctionId, connectionType} = connectingInfo;

        if (connectionType === 'source') {
            return canBeConnected(
                functions,
                sourceFunctionId,
                functionId,
                parameterIndex
            );
        } else {
            return false;
        }
    };

    const canReturnTypeConnect = (): boolean => {
        if (!functionId || namespaceState !== 'connecting' || !connectingInfo) {
            return true;
        }

        const {sourceFunctionId, sourceHandleId, connectionType} = connectingInfo;

        if (connectionType === 'target') {
            if (!returnType || returnType === 'Unit') {
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
        } else {
            return false;
        }
    };

    const isConnecting = namespaceState === 'connecting';
    const isSourceNode = functionId === connectingInfo?.sourceFunctionId;

    return (
        <pre className={styles.kotlinCode}>
            <span style={{color: '#569cd6'}}>fun</span> {functionName}(
            {paramEntries.length > 0 && (
                <>
                    {'\n'}
                    {paramEntries.map(([name, type], index) => {
                        const canConnect = canParameterConnect(index);
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
