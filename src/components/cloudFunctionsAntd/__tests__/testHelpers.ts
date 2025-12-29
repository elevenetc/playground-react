import type {Function} from '../Function';

export const createFunction = (
    id: string,
    name: string,
    args: [string, string][],
    returnType: string,
    sourceCode: string
): Function => ({
    id,
    name,
    arguments: new Map(args),
    returnType,
    sourceCode,
    state: 'idle'
});
