import { Button, Space } from 'antd';

export default function LeftPanel() {
    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
            <Space orientation="vertical" style={{ width: '100%' }}>
                <Button type="default" block>Foo</Button>
                <Button type="default" block>Bar</Button>
            </Space>
        </div>
    );
}
