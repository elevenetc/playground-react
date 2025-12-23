import { Node, Edge } from 'reactflow';
import { FunctionNodeData } from './FunctionNode';
import { FunctionData } from './FunctionData';
import { FunctionCallGraph } from './FunctionCallGraph';

const processInputData = new FunctionData(
    '1',
    'processInput',
    'String',
    [['input', 'String']],
    'fun processInput(input: String): String { return input.trim() }'
);

const validateDataData = new FunctionData(
    '2',
    'validateData',
    'Boolean',
    [['data', 'String']],
    'fun validateData(data: String): Boolean { return data.isNotEmpty() }'
);

export const demoNodes: Node<FunctionNodeData>[] = [
    {
        id: '1',
        type: 'functionNode',
        data: { functionData: processInputData },
        position: { x: 250, y: 50 },
    },
    {
        id: '2',
        type: 'functionNode',
        data: { functionData: validateDataData },
        position: { x: 250, y: 200 },
    }
];

export const demoEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
];

export const demoGraph = new FunctionCallGraph();
demoGraph.addFunction(processInputData);
demoGraph.addFunction(validateDataData);
demoGraph.addCall('1', '2');
