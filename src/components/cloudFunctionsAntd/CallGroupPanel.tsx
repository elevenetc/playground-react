"use client";

import {Button, Tabs, Tag} from 'antd';
import {ClearOutlined, CopyOutlined, PlayCircleOutlined} from '@ant-design/icons';
import {useStore} from './state/store';
import {ExecutionLogEntry} from './ExecutionLog';

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
}

function formatValue(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function formatLogAsText(entry: ExecutionLogEntry): string {
    const time = formatTime(entry.timestamp);
    switch (entry.type) {
        case 'call-start':
            return `${time} [START] Call group execution started`;
        case 'function-call-start': {
            const params = entry.parameters
                ? Object.entries(entry.parameters).map(([k, v]) => `${k}=${formatValue(v)}`).join(', ')
                : '';
            return `${time} [CALL] ${entry.functionName}(${params})`;
        }
        case 'function-call-end':
            if (entry.error) {
                return `${time} [ERROR] ${entry.functionName} threw: ${entry.error}`;
            }
            return `${time} [RETURN] ${entry.functionName} → ${formatValue(entry.returnValue)}`;
        case 'call-end':
            if (entry.error) {
                return `${time} [END] Execution failed: ${entry.error}`;
            }
            return `${time} [END] Call group execution completed`;
        default:
            return `${time} [${entry.type}]`;
    }
}

function LogEntry({entry}: { entry: ExecutionLogEntry }) {
    const getTagColor = () => {
        switch (entry.type) {
            case 'call-start':
                return 'blue';
            case 'function-call-start':
                return 'cyan';
            case 'function-call-end':
                return entry.error ? 'red' : 'green';
            case 'call-end':
                return entry.error ? 'red' : 'purple';
            default:
                return 'default';
        }
    };

    const getLabel = () => {
        switch (entry.type) {
            case 'call-start':
                return 'START';
            case 'function-call-start':
                return 'CALL';
            case 'function-call-end':
                return entry.error ? 'ERROR' : 'RETURN';
            case 'call-end':
                return 'END';
            default:
                return entry.type;
        }
    };

    const renderContent = () => {
        switch (entry.type) {
            case 'call-start':
                return <span className="text-gray-400">Call group execution started</span>;
            case 'function-call-start':
                return (
                    <span>
                        <span className="text-blue-400">{entry.functionName}</span>
                        <span className="text-gray-400">(</span>
                        {entry.parameters && Object.entries(entry.parameters).map(([key, value], i, arr) => (
                            <span key={key}>
                                <span className="text-orange-400">{key}</span>
                                <span className="text-gray-400">=</span>
                                <span className="text-green-400">{formatValue(value)}</span>
                                {i < arr.length - 1 && <span className="text-gray-400">, </span>}
                            </span>
                        ))}
                        <span className="text-gray-400">)</span>
                    </span>
                );
            case 'function-call-end':
                if (entry.error) {
                    return (
                        <span>
                            <span className="text-blue-400">{entry.functionName}</span>
                            <span className="text-red-400"> threw: {entry.error}</span>
                        </span>
                    );
                }
                return (
                    <span>
                        <span className="text-blue-400">{entry.functionName}</span>
                        <span className="text-gray-400"> → </span>
                        <span className="text-green-400">{formatValue(entry.returnValue)}</span>
                    </span>
                );
            case 'call-end':
                if (entry.error) {
                    return <span className="text-red-400">Execution failed: {entry.error}</span>;
                }
                return <span className="text-gray-400">Call group execution completed</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex items-start gap-2 py-1 font-mono text-xs">
            <span className="text-gray-500 shrink-0">{formatTime(entry.timestamp)}</span>
            <Tag color={getTagColor()} className="shrink-0 text-xs">{getLabel()}</Tag>
            <span className="flex-1 break-all">{renderContent()}</span>
        </div>
    );
}

export default function CallGroupPanel() {
    const {
        selectedFunctionId,
        getCallGroupForFunction,
        runFunction,
        getExecutionLogsForCallGroup,
        clearExecutionLogs
    } = useStore();

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

    const logs = getExecutionLogsForCallGroup(callGroup.id);

    const handleRun = () => {
        const firstRoot = callGroup.rootFunctionIds[0];
        if (firstRoot) {
            runFunction(firstRoot);
        }
    };

    const handleClearLogs = () => {
        clearExecutionLogs(callGroup.id);
    };

    const handleCopyLogs = () => {
        const text = logs.map(formatLogAsText).join('\n');
        navigator.clipboard.writeText(text);
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

    const logsContent = (
        <div className="h-full flex flex-col">
            <div className="flex justify-end gap-2 mb-2">
                <Button
                    size="small"
                    icon={<CopyOutlined/>}
                    onClick={handleCopyLogs}
                    disabled={logs.length === 0}
                >
                    Copy
                </Button>
                <Button
                    size="small"
                    icon={<ClearOutlined/>}
                    onClick={handleClearLogs}
                    disabled={logs.length === 0}
                >
                    Clear
                </Button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-900/50 rounded p-2">
                {logs.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No logs yet. Run the call group to see execution
                        logs.</div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((entry) => (
                            <LogEntry key={entry.id} entry={entry}/>
                        ))}
                    </div>
                )}
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
            label: `Log${logs.length > 0 ? ` (${logs.length})` : ''}`,
            children: logsContent,
        },
    ];

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm rounded-lg overflow-auto px-4 py-2">
            <Tabs items={items} size="small"/>
        </div>
    );
}
