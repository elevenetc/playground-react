"use client";
import React from "react";
import { useTree } from "../context/FileTreeContext";

export default function HeaderTitle() {
  const { rootName, tree } = useTree();
  // Show nothing if no folder selected or no root name could be determined
  if (!tree || !rootName) return null;
  return <span className="text-lg font-semibold px-2">{rootName}</span>;
}
