"use client";

import {memo} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import FunctionContainer from '../functionContainer/FunctionContainer';
import {FunctionData} from './FunctionData';

export type FunctionNodeData = {
    functionData: FunctionData;
};

function FunctionNode({ data }: NodeProps<FunctionNodeData>) {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <FunctionContainer
                functionData={data.functionData}
                functionId={data.functionData.id}
            />
            <Handle type="source" position={Position.Bottom} />
        </>
    );
}

export default memo(FunctionNode);
