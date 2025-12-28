import {Function} from './Function';

export function canBeConnected(
    functions: Record<string, Function>,
    outFunctionId: string,
    inFunctionId: string,
    argumentIndex: number
): boolean {
    const outFunction = functions[outFunctionId];
    const inFunction = functions[inFunctionId];

    if (!outFunction || !inFunction) {
        console.log(`Function ${outFunctionId} or ${inFunctionId} not found`);
        console.log(functions);
        return false;
    }

    if (outFunction.returnType === 'Unit') {
        console.log(`Function ${outFunctionId} cannot be connected to ${inFunctionId} because it returns Unit`);
        return false;
    }

    const inFunctionArgs = Array.from(inFunction.arguments.values());
    if (argumentIndex < 0 || argumentIndex >= inFunctionArgs.length) {
        console.log(`Argument index ${argumentIndex} out of range for function ${inFunctionId}`);
        return false;
    }

    const targetArgType = inFunctionArgs[argumentIndex];
    return outFunction.returnType === targetArgType;
}
