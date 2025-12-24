import * as styles from './FunctionContainer.css';

export const PARAMETER_LINE_HEIGHT = 20; // Matches kotlinCode lineHeight: 1.25rem (20px)
export const SIGNATURE_FIRST_LINE_HEIGHT = 43;

type FunctionSignatureProps = {
    functionName: string;
    parameters: Record<string, string>;
    returnType?: string;
};

export default function FunctionSignatureComponent({functionName, parameters, returnType}: FunctionSignatureProps) {
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
            ){returnType ? (
            <>
                {': '}
                <span style={{color: '#4ec9b0'}}>{returnType}</span>
            </>
        ) : null}
        </pre>
    );
}
