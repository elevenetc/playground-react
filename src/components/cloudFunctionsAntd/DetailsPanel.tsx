"use client";

import {Tabs} from 'antd';
import {Function} from './Function';
import {useStore} from './state/store';
import NamespaceDetailsView from './NamespaceDetailsView';
import FunctionDetailsView from './FunctionDetailsView';

type DetailsPanelProps = {
    selectedFunction: Function | null;
    onCreateFunction: (sourceCode: string) => void;
    onRunFunction: (functionId: string) => void;
};

export default function DetailsPanel({selectedFunction, onCreateFunction, onRunFunction}: DetailsPanelProps) {
    const {selectedNamespaceId, getSelectedNamespace} = useStore();
    const selectedNamespace = selectedNamespaceId ? getSelectedNamespace() : null;

    const items = [
        {
            key: 'namespace',
            label: 'Namespace',
            children: (
                <NamespaceDetailsView
                    selectedNamespace={selectedNamespace}
                    onCreateFunction={onCreateFunction}
                />
            ),
        },
        {
            key: 'function',
            label: 'Function',
            children: (
                <FunctionDetailsView
                    selectedFunction={selectedFunction}
                    onCreateFunction={onCreateFunction}
                    onRunFunction={onRunFunction}
                />
            ),
        },
    ];

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg overflow-auto">
            <Tabs
                defaultActiveKey="namespace"
                items={items}
                className="h-full"
                style={{padding: '0 16px'}}
            />
        </div>
    );
}
