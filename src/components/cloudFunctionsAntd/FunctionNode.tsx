"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import FunctionContainer from '../functionContainer/FunctionContainer';
import { FunctionData } from './FunctionData';

export type FunctionNodeData = {
    functionData: FunctionData;
};

function FunctionNode({ data }: NodeProps<FunctionNodeData>) {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <FunctionContainer
                functionData={data.functionData}
            />
            <Handle type="source" position={Position.Bottom} />
        </>
    );
}

export default memo(FunctionNode);
