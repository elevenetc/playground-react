import {Edge, Node} from 'reactflow';
import {FunctionNodeData} from './FunctionNode';
import {Function} from './Function';
import {Project} from './Project';

const processInputData = new Function('1', 'start', [], 'String', 'fun start(): String { return "foo" }');

const validateDataData = new Function('2', 'validateData', [['data', 'String'], ['dataStr', 'String'], ['dataInt', 'Int']], 'Boolean', 'fun validateData(data: String, dataStr: String, dataInt: Int): Boolean { return data.isNotEmpty() }');

const transformDataData = new Function('3', 'transformData', [['validationResult', 'Boolean']], 'List<Int>', 'fun transformData(validationResult: Boolean): List<Int> { return listOf(1, 2, 3) }');

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

export const demoGraph = new Project();
demoGraph.addFunction(processInputData);
demoGraph.addFunction(validateDataData);
demoGraph.addFunction(transformDataData);
demoGraph.addConnection('1', '2');
demoGraph.addConnection('2', '3');
