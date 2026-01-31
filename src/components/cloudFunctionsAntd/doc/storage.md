# Storage

## State Management

Single Zustand store in `state/store.ts`.

### State Shape

```typescript
interface AppState {
  // UI
  selectedFunctionId: string | null
  selectedNamespaceId: string | null
  namespaceState: 'idle' | 'running' | 'connecting'
  connectingInfo: ConnectingInfo | null

  // Data
  namespaces: Namespace[]
  callGroups: Map<string, CallGroup>
  executionLogs: ExecutionLogEntry[]
  loading: 'loading' | 'loaded' | 'loadingError'
  error: string | null
}
```

### Key Actions

| Action                | Purpose                   |
|-----------------------|---------------------------|
| `selectFunction(id)`  | Set selected function     |
| `selectNamespace(id)` | Set selected namespace    |
| `fetchNamespaces()`   | Load from API             |
| `addFunction()`       | Add function to namespace |
| `deleteFunction()`    | Remove function           |
| `setFunctionState()`  | Update function state     |
| `runFunction()`       | Execute function          |
| `addConnection()`     | Connect functions         |
| `removeConnection()`  | Disconnect functions      |

### Derived Getters

| Getter                   | Returns                          |
|--------------------------|----------------------------------|
| `getSelectedNamespace()` | Current namespace                |
| `getSelectedFunction()`  | Current function                 |
| `getEdges()`             | ReactFlow edges from connections |
| `getCallGroups(nsId)`    | Call groups for namespace        |

## Persistence

`db/LocalDb.ts` - localStorage wrapper for namespaces.

### API

```typescript
LocalDb.loadNamespaces(): NamespaceDto[]
LocalDb.saveNamespaces(namespaces): void
LocalDb.loadCallGroups(namespaceId): CallGroupDto[]
LocalDb.saveCallGroups(namespaceId, groups): void
```

## Event Subscription

`state/subscribeToEvents.ts` handles API events:

```typescript
function | callGroup | executionLog events → store updates
```
