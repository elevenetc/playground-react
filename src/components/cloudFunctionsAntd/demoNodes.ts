import { Node, Edge } from 'reactflow';
import { FunctionNodeData } from './FunctionNode';
import { FunctionData } from './FunctionData';

export const demoNodes: Node<FunctionNodeData>[] = [
    {
        id: '1',
        type: 'functionNode',
        data: {
            functionData: new FunctionData(
                'processInput',
                'String',
                [['input', 'String']],
                'fun processInput(input: String): String { return input.trim() }'
            )
        },
        position: { x: 250, y: 50 },
    },
    {
        id: '2',
        type: 'functionNode',
        data: {
            functionData: new FunctionData(
                'validateData',
                'Boolean',
                [['data', 'String']],
                'fun validateData(data: String): Boolean { return data.isNotEmpty() }'
            )
        },
        position: { x: 250, y: 200 },
    }
];

export const demoEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
];
