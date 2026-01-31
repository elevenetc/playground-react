# UI Components

## Layout

| Component                    | Location | Purpose                           |
|------------------------------|----------|-----------------------------------|
| `CloudFunctionsAntd.tsx`     | Root     | Main layout, data loading         |
| `FunctionsFlowComponent.tsx` | Center   | ReactFlow canvas                  |
| `MenuPanel.tsx`              | Top      | Create namespace/function buttons |
| `NamespacesPanel.tsx`        | Left     | Namespace list                    |
| `DetailsPanel.tsx`           | Right    | Selected item details             |
| `CallGroupPanel.tsx`         | Bottom   | Execution groups and logs         |

## ReactFlow Components

| Component          | Purpose                               |
|--------------------|---------------------------------------|
| `FunctionNode.tsx` | Custom node with input/output handles |

## Detail Views

| Component                  | Shows when                               |
|----------------------------|------------------------------------------|
| `NamespaceDetailsView.tsx` | Namespace selected, no function selected |
| `FunctionDetailsView.tsx`  | Function selected                        |

## Modals

| Component                  | Triggered by           |
|----------------------------|------------------------|
| `CreateNamespaceModal.tsx` | "New Namespace" button |
| `CreateFunctionModal.tsx`  | "New Function" button  |

## Modifying Components

**Change node appearance**: Edit `FunctionNode.tsx`

**Change panel layout**: Edit `CloudFunctionsAntd.tsx` (lines 128-172)

**Add new detail tab**: Edit `DetailsPanel.tsx`

**Change function form**: Edit `CreateFunctionModal.tsx`
