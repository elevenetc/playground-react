"use client";

import { useState } from 'react';
import { Button } from 'antd';
import CreateFunctionModal from './CreateFunctionModal';

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

            <CreateFunctionModal
                open={open}
                onClose={() => setOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}
