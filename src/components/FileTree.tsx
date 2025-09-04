"use client";
import React from "react";
import { TreeNode, useTree } from "../context/FileTreeContext";

function TreeView({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.name}>
          {node.type === "folder" ? (
            <details>
              <summary>{node.name}</summary>
              {node.children && node.children.length > 0 && <TreeView nodes={node.children} />}
            </details>
          ) : (
            <a>{node.name}</a>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function FileTree() {
  const { tree } = useTree();

  if (!tree) {
    return (
      <div className="p-4 w-80 text-sm text-base-content/70">No folder selected. Use the header icon to pick a folder.</div>
    );
  }

  return (
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      <TreeView nodes={tree} />
    </ul>
  );
}
