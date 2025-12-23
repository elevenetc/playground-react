export class FunctionCall {
    sourceId: string;
    targetId: string;

    constructor(sourceId: string, targetId: string) {
        this.sourceId = sourceId;
        this.targetId = targetId;
    }
}
