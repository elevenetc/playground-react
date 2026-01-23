import {Button, List, Typography} from 'antd';
import {useState} from 'react';
import type {Namespace} from './namespaces/Namespace';
import CreateNamespaceModal from './CreateNamespaceModal';
import CreateFunctionModal from './CreateFunctionModal';
import {api} from './api/FakeCloudKotlinFunctionsApi';
import {useAppDispatch} from './state/hooks';
import {fetchNamespaces} from './namespaces/namespacesSlice';

const {Text} = Typography;

type NamespaceDetailsViewProps = {
    selectedNamespace: Namespace | null;
    onCreateFunction: (sourceCode: string) => void;
};

export default function NamespaceDetailsView({selectedNamespace, onCreateFunction}: NamespaceDetailsViewProps) {
    const dispatch = useAppDispatch();
    const [showCreateNamespaceModal, setShowCreateNamespaceModal] = useState(false);
    const [showCreateFunctionModal, setShowCreateFunctionModal] = useState(false);

    const handleCreateNamespace = (name: string) => {
        api.createNamespace(name);
        dispatch(fetchNamespaces());
        setShowCreateNamespaceModal(false);
    };

    const handleCreateFunction = (sourceCode: string) => {
        onCreateFunction(sourceCode);
        setShowCreateFunctionModal(false);
    };

    if (!selectedNamespace) {
        return (
            <>
                <div className="h-full flex items-center justify-center">
                    <Button
                        type="link"
                        onClick={() => setShowCreateNamespaceModal(true)}
                        style={{
                            padding: 0,
                            height: 'auto',
                            textDecoration: 'underline',
                            color: 'white'
                        }}
                    >
                        Create namespace
                    </Button>
                </div>

                <CreateNamespaceModal
                    visible={showCreateNamespaceModal}
                    onOk={handleCreateNamespace}
                    onCancel={() => setShowCreateNamespaceModal(false)}
                />
            </>
        );
    }

    return (
        <>
            <div className="text-white space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedNamespace.name}</h3>
                    <div className="flex gap-2">
                        <Button style={{flex: '1 1 0'}}>
                            Edit
                        </Button>
                        <Button danger style={{flex: '1 1 0'}}>
                            Delete
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-400 mb-2">Functions</div>
                    {selectedNamespace.functions.length === 0 ? (
                        <Button
                            type="link"
                            onClick={() => setShowCreateFunctionModal(true)}
                            style={{
                                padding: 0,
                                height: 'auto',
                                textDecoration: 'underline',
                                color: 'white'
                            }}
                        >
                            Create function
                        </Button>
                    ) : (
                        <List
                            size="small"
                            dataSource={selectedNamespace.functions}
                            renderItem={(func) => (
                                <List.Item className="text-white border-gray-700">
                                    <Text className="font-mono text-white">{func.name}</Text>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </div>

            <CreateFunctionModal
                open={showCreateFunctionModal}
                onClose={() => setShowCreateFunctionModal(false)}
                onCreate={handleCreateFunction}
            />
        </>
    );
}
