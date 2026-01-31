# Architecture

## Overview

React app for visual function composition using ReactFlow + Zustand + Ant Design.

## Component Tree

```
CloudFunctionsAntd
├── FunctionsFlowComponent (ReactFlow canvas)
├── MenuPanel (top bar)
├── NamespacesPanel (left sidebar)
├── DetailsPanel (right sidebar)
└── CallGroupPanel (bottom panel)
```

## Data Models

```typescript
Namespace
{
    id, name, functions[], connections[]
}
Function
{
    id, name, returnType, arguments, sourceCode, state
}
FunctionConnection
{
    outFunctionId, targetFunctionId, targetArgIndex
}
CallGroup
{
    id, namespaceId, functionIds, rootFunctionIds, canRun
}
```

## Key Patterns

1. **Single Store** - All state in `state/store.ts`
2. **Namespace Scoping** - Functions and connections belong to namespaces
3. **Event-Driven Updates** - API emits events → store subscribes → UI updates
4. **Derived State** - Edges computed from connections via `getEdges()`

## Data Flow

```
API Events → subscribeToEvents() → store action → React re-render
User Action → store action → API call → API Event (loop back)
```
