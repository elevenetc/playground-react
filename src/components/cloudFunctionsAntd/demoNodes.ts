import {Edge, Node} from 'reactflow';
import {FunctionNodeData} from './FunctionNode';
import {FunctionData} from './FunctionData';
import {FunctionCallGraph} from './FunctionCallGraph';

const processInputData = new FunctionData('1', 'start', [], 'String', 'fun start(): String { return "foo" }');

const validateDataData = new FunctionData('2', 'validateData', [['data', 'String'], ['dataStr', 'String'], ['dataInt', 'Int']], 'Boolean', 'fun validateData(data: String, dataStr: String, dataInt: Int): Boolean { return data.isNotEmpty() }');

const transformDataData = new FunctionData('3', 'transformData', [['validationResult', 'Boolean']], 'List<Int>', 'fun transformData(validationResult: Boolean): List<Int> { return listOf(1, 2, 3) }');

export const demoNodes: Node<FunctionNodeData>[] = [
    {
        id: '1',
        type: 'functionNode',
        data: {functionData: processInputData},
        position: {x: 50, y: 250},
    },
    {
        id: '2',
        type: 'functionNode',
        data: {functionData: validateDataData},
        position: {x: 400, y: 250},
    },
    {
        id: '3',
        type: 'functionNode',
        data: {functionData: transformDataData},
        position: {x: 750, y: 250},
    }
];

export const demoEdges: Edge[] = [
    {id: 'e1-2', source: '1', target: '2', sourceHandle: 'output', targetHandle: '0'},
    {id: 'e2-3', source: '2', target: '3', sourceHandle: 'output', targetHandle: '0'},
];

export const demoGraph = new FunctionCallGraph();
demoGraph.addFunction(processInputData);
demoGraph.addFunction(validateDataData);
demoGraph.addFunction(transformDataData);
demoGraph.addCall('1', '2');
demoGraph.addCall('2', '3');
