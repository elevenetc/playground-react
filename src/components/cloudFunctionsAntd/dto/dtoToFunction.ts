import {FunctionDto} from "@/components/cloudFunctionsAntd/api/CloudKotlinFunctionsApi";
import {Function, FunctionState} from '../Function';

export const dtoToFunction = (dto: FunctionDto): Function => {
    const args: [string, string][] = dto.arguments.map(arg => [
        arg.name,
        arg.type.name + (arg.nullable ? '?' : '')
    ]);

    const returnType = dto.returnType.name + (dto.returnType.nullable ? '?' : '');

    return {
        id: dto.id,
        name: dto.name,
        arguments: new Map(args),
        returnType: returnType,
        sourceCode: dto.sourceCode,
        state: dto.state as FunctionState
    };
};
