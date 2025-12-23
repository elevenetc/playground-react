import {Edge, Node} from 'reactflow';
import {FunctionNodeData} from './FunctionNode';
import {FunctionData} from './FunctionData';
import {FunctionCallGraph} from './FunctionCallGraph';

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

const transformDataData = new FunctionData(
    '3',
    'transformData',
    'List<Int>',
    [['data', 'String']],
    'fun transformData(data: String): List<Int> { return data.split(",").map { it.toInt() } }'
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
        position: {x: 250, y: 220},
    },
    {
        id: '3',
        type: 'functionNode',
        data: {functionData: transformDataData},
        position: {x: 250, y: 390},
    }
];

export const demoEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    {id: 'e2-3', source: '2', target: '3'},
];

export const demoGraph = new FunctionCallGraph();
demoGraph.addFunction(processInputData);
demoGraph.addFunction(validateDataData);
demoGraph.addFunction(transformDataData);
demoGraph.addCall('1', '2');
demoGraph.addCall('2', '3');
