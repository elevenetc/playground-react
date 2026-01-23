import {useState} from 'react';
import type {MenuProps} from 'antd';
import {Button, Dropdown} from 'antd';
import {AppstoreAddOutlined, InfoCircleOutlined} from '@ant-design/icons';
import CreateNamespaceModal from './CreateNamespaceModal';
import {api} from './api/FakeCloudKotlinFunctionsApi';
import {useStore} from './state/store';

export default function MenuPanel() {
    const {fetchNamespaces} = useStore();
    const [showCreateNamespaceModal, setShowCreateNamespaceModal] = useState(false);

    const handleMenuClick: MenuProps['onClick'] = ({key}) => {
        if (key === 'namespace') {
            setShowCreateNamespaceModal(true);
        } else if (key === 'function') {
            // TODO: Handle function creation
        }
    };

    const handleCreateNamespace = (name: string) => {
        api.createNamespace(name);
        fetchNamespaces();
        setShowCreateNamespaceModal(false);
    };

    const newItems: MenuProps['items'] = [
        {
            key: 'namespace',
            label: 'Namespace...',
        },
        {
            key: 'function',
            label: 'Function...',
        },
    ];

    return (
        <>
            <div className="bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg mb-2">
                <Dropdown menu={{items: newItems, onClick: handleMenuClick}} placement="bottomLeft">
                    <Button icon={<AppstoreAddOutlined/>}>
                        New
                    </Button>
                </Dropdown>
                <Dropdown placement="bottomLeft">
                    <Button icon={<InfoCircleOutlined/>}>
                        Help
                    </Button>
                </Dropdown>
            </div>

            <CreateNamespaceModal
                visible={showCreateNamespaceModal}
                onOk={handleCreateNamespace}
                onCancel={() => setShowCreateNamespaceModal(false)}
            />
        </>
    );
}
