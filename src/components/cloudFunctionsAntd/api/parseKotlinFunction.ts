import {FunctionArgumentDto, FunctionDto, TypeDto} from './CloudKotlinFunctionsApi';

/**
 * Parses Kotlin function source code into FunctionDto.
 * Expects perfect formatting and supports only primitive types.
 * Sets state to 'build-error' if parsing fails.
 */
export function parseKotlinFunction(source: string): FunctionDto {
    const functionId = crypto.randomUUID();

    try {
        // Extract function name: fun functionName(
        const nameMatch = source.match(/fun\s+(\w+)\s*\(/);
        if (!nameMatch) {
            return createErrorFunction(functionId, source, 'Missing function name');
        }
        const name = nameMatch[1];

        // Extract parameters: (param1: Type1, param2: Type2)
        const paramsMatch = source.match(/\(([^)]*)\)/);
        if (!paramsMatch) {
            return createErrorFunction(functionId, source, 'Missing parameters section');
        }

        const paramsString = paramsMatch[1].trim();
        const args: FunctionArgumentDto[] = [];

        if (paramsString) {
            const paramParts = paramsString.split(',');
            for (let i = 0; i < paramParts.length; i++) {
                const part = paramParts[i].trim();

                // Match: paramName: ParamType or paramName: ParamType?
                const paramMatch = part.match(/^(\w+)\s*:\s*(\w+)(\?)?$/);
                if (!paramMatch) {
                    return createErrorFunction(functionId, source, `Invalid parameter format: ${part}`);
                }

                const [, paramName, typeName, nullable] = paramMatch;

                args.push({
                    id: `${functionId}-arg-${i}`,
                    name: paramName,
                    type: {
                        name: typeName,
                        nullable: !!nullable
                    },
                    nullable: !!nullable,
                    defaultValue: ''
                });
            }
        }

        // Extract return type: ): ReturnType or ): ReturnType? or no return type (Unit)
        const returnTypeMatch = source.match(/\)\s*:\s*(\w+)(\?)?/);
        let returnType: TypeDto;

        if (returnTypeMatch) {
            const [, typeName, nullable] = returnTypeMatch;
            returnType = {
                name: typeName,
                nullable: !!nullable
            };
        } else {
            // No explicit return type means Unit
            returnType = {
                name: 'Unit',
                nullable: false
            };
        }

        return {
            id: functionId,
            name,
            returnType,
            arguments: args,
            sourceCode: source,
            state: 'idle'
        };

    } catch (error) {
        return createErrorFunction(
            functionId,
            source,
            error instanceof Error ? error.message : 'Unknown parsing error'
        );
    }
}

function createErrorFunction(id: string, sourceCode: string, errorMessage: string): FunctionDto {
    return {
        id,
        name: 'parse-error',
        returnType: {name: 'Error', nullable: false},
        arguments: [],
        sourceCode,
        state: 'build-error',
        errorMessage
    };
}
