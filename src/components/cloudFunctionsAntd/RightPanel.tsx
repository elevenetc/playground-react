"use client";

import {useState} from 'react';
import {Button} from 'antd';
import CreateFunctionModal from './CreateFunctionModal';
import {Function} from './Function';

type RightPanelProps = {
    selectedFunction: Function | null;
    onCreateFunction: (sourceCode: string) => void;
    onRunFunction: (functionId: string) => void;
};

export default function RightPanel({selectedFunction, onCreateFunction, onRunFunction}: RightPanelProps) {
    const [open, setOpen] = useState(false);

    const handleCreate = (sourceCode: string) => {
        onCreateFunction(sourceCode);
        setOpen(false);
    };

    if (!selectedFunction) {
        return (
            <div className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center p-4">
                <div className="text-center text-white">
                    Select or{' '}
                    <Button
                        type="link"
                        onClick={() => setOpen(true)}
                        style={{
                            padding: 0,
                            height: 'auto',
                            textDecoration: 'underline',
                            color: 'white'
                        }}
                    >
                        create
                    </Button>
                    {' '}a function
                </div>

                <CreateFunctionModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onCreate={handleCreate}
                />
            </div>
        );
    }

    const params = Array.from(selectedFunction.arguments.entries());

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 overflow-auto">
            <div className="text-white space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Function Details</h3>
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            style={{flex: '1 1 0'}}
                            onClick={() => onRunFunction(selectedFunction.id)}
                        >
                            Run
                        </Button>
                        <Button style={{flex: '1 1 0'}}>
                            Edit
                        </Button>
                        <Button danger style={{flex: '1 1 0'}}>
                            Delete
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="font-mono">{selectedFunction.name}</div>
                </div>

                <div>
                    <div className="text-sm text-gray-400">Parameters</div>
                    {params.length === 0 ? (
                        <div className="text-gray-500 italic">No parameters</div>
                    ) : (
                        <div className="space-y-1">
                            {params.map(([name, type]) => (
                                <div key={name} className="font-mono text-sm">
                                    {name}: <span className="text-blue-400">{type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="text-sm text-gray-400">Return Type</div>
                    <div className="font-mono text-blue-400">{selectedFunction.returnType}</div>
                </div>

                <div>
                    <div className="text-sm text-gray-400">State</div>
                    <div className="font-mono">
                        <span className={
                            selectedFunction.state === 'idle' ? 'text-green-400' :
                                selectedFunction.state === 'running' ? 'text-yellow-400' :
                                    selectedFunction.state === 'building' ? 'text-blue-400' :
                                        'text-red-400'
                        }>
                            {selectedFunction.state}
                        </span>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-400 mb-2">Source Code</div>
                    <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                        <code>{selectedFunction.sourceCode}</code>
                    </pre>
                </div>
            </div>

            <CreateFunctionModal
                open={open}
                onClose={() => setOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}
