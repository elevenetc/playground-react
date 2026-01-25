"use client";

import {Button, Tabs} from 'antd';
import {PlayCircleOutlined} from '@ant-design/icons';
import {useStore} from './state/store';

export default function CallGroupPanel() {
    const {selectedFunctionId, getCallGroupForFunction, runFunction} = useStore();

    if (!selectedFunctionId) {
        return (
            <div
                className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400">
                Select a function
            </div>
        );
    }

    const callGroup = getCallGroupForFunction(selectedFunctionId);

    if (!callGroup) {
        return (
            <div
                className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400">
                No call group found
            </div>
        );
    }

    const handleRun = () => {
        const firstRoot = callGroup.rootFunctionIds[0];
        if (firstRoot) {
            runFunction(firstRoot);
        }
    };

    const infoContent = (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <span className={callGroup.canRun.can ? 'text-green-400' : 'text-red-400'}>
                    {callGroup.canRun.can ? 'Ready to run' : 'Cannot run'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Functions:</span>
                <span className="text-white">{callGroup.functionIds.size}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Roots:</span>
                <span className="text-white">{callGroup.rootFunctionIds.length}</span>
            </div>
            <div className="pt-2">
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined/>}
                    onClick={handleRun}
                    disabled={!callGroup.canRun.can}
                >
                    Run
                </Button>
            </div>
        </div>
    );

    const items = [
        {
            key: 'info',
            label: 'Info',
            children: infoContent,
        },
        {
            key: 'tree',
            label: 'Tree',
            children: <div className="text-gray-400">Coming soon</div>,
        },
        {
            key: 'log',
            label: 'Log',
            children: <div className="text-gray-400">Coming soon</div>,
        },
    ];

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg overflow-auto px-4 py-2">
            <Tabs items={items} size="small"/>
        </div>
    );
}
