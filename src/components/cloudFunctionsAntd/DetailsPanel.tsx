"use client";

import {Tabs} from 'antd';
import {Function} from './Function';
import {useAppSelector} from './state/hooks';
import {selectSelectedNamespaceId} from './state/selectors';
import {namespacesSelectors} from './namespaces/namespacesSlice';
import NamespaceDetailsView from './NamespaceDetailsView';
import FunctionDetailsView from './FunctionDetailsView';

type DetailsPanelProps = {
    selectedFunction: Function | null;
    onCreateFunction: (sourceCode: string) => void;
    onRunFunction: (functionId: string) => void;
};

export default function DetailsPanel({selectedFunction, onCreateFunction, onRunFunction}: DetailsPanelProps) {
    const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId);
    const namespaces = useAppSelector(namespacesSelectors.selectAll);
    const selectedNamespace = selectedNamespaceId
        ? namespaces.find(ns => ns.id === selectedNamespaceId) || null
        : null;

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
