"use client";

import {Function} from './Function';
import {useStore} from './state/store';
import NamespaceDetailsView from './NamespaceDetailsView';
import FunctionDetailsView from './FunctionDetailsView';

type DetailsPanelProps = {
    selectedFunction: Function | null;
    onCreateFunction: (sourceCode: string) => void;
    onRunFunction: (functionId: string) => void;
    onDeleteFunction: (functionId: string) => void;
};

export default function DetailsPanel({
                                         selectedFunction,
                                         onCreateFunction,
                                         onRunFunction,
                                         onDeleteFunction
                                     }: DetailsPanelProps) {
    const {selectedNamespaceId, getSelectedNamespace} = useStore();
    const selectedNamespace = selectedNamespaceId ? getSelectedNamespace() : null;

    const renderContent = () => {
        if (selectedFunction) {
            return (
                <FunctionDetailsView
                    selectedFunction={selectedFunction}
                    onCreateFunction={onCreateFunction}
                    onRunFunction={onRunFunction}
                    onDeleteFunction={onDeleteFunction}
                />
            );
        }
        if (selectedNamespace) {
            return (
                <NamespaceDetailsView
                    selectedNamespace={selectedNamespace}
                    onCreateFunction={onCreateFunction}
                />
            );
        }
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                Select namespace or function
            </div>
        );
    };

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg overflow-auto p-4">
            {renderContent()}
        </div>
    );
}
