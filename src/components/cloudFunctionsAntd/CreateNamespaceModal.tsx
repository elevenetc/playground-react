import {useState} from 'react';
import PopupComponent from '../popup/PopupComponent';
import {Input} from 'antd';

type CreateNamespaceModalProps = {
    visible: boolean;
    onOk: (name: string) => void;
    onCancel: () => void;
};

export default function CreateNamespaceModal({visible, onOk, onCancel}: CreateNamespaceModalProps) {
    const [name, setName] = useState('');

    const handleOk = () => {
        if (name.trim()) {
            onOk(name.trim());
            setName('');
        }
    };

    const handleCancel = () => {
        setName('');
        onCancel();
    };

    const content = (
        <div style={{padding: '16px'}}>
            <label style={{display: 'block', marginBottom: '8px', color: '#fff'}}>
                Namespace Name:
            </label>
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter namespace name"
                onPressEnter={handleOk}
                autoFocus
            />
        </div>
    );

    return (
        <PopupComponent
            visible={visible}
            title="Create New Namespace"
            content={content}
            onOk={handleOk}
            onCancel={handleCancel}
            minWidth="400px"
            minHeight="200px"
        />
    );
}
