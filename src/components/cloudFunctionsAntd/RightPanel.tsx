"use client";

import { useState } from 'react';
import { Button, Modal } from 'antd';

export default function RightPanel() {
    const [open, setOpen] = useState(false);

    const handleCreate = () => {
        console.log('Function created');
        setOpen(false);
    };

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

            <Modal
                title="New Function"
                open={open}
                onOk={handleCreate}
                onCancel={() => setOpen(false)}
                transitionName=""
                width={600}
                style={{ minHeight: 350 }}
            >
                <div style={{ padding: '20px 0' }}>
                    Enter function details here...
                </div>
            </Modal>
        </div>
    );
}
