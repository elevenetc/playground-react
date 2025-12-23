export class FunctionData {
    id: string;
    name: string;
    returnType: string;
    arguments: Map<string, string>;
    sourceCode: string;

    constructor(
        id: string,
        name: string,
        returnType: string,
        args: Map<string, string> | [string, string][],
        sourceCode: string
    ) {
        this.id = id;
        this.name = name;
        this.returnType = returnType;
        this.arguments = args instanceof Map ? args : new Map(args);
        this.sourceCode = sourceCode;
    }

    getArgumentsAsRecord(): Record<string, string> {
        return Object.fromEntries(this.arguments);
    }
}
