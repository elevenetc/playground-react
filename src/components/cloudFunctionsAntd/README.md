# CloudFunctionsAntd

Visual editor for composing Kotlin cloud functions using ReactFlow.

## Quick Reference

| Task                           | File                                         |
|--------------------------------|----------------------------------------------|
| Add/modify UI layout           | `CloudFunctionsAntd.tsx`                     |
| Change function node rendering | `FunctionNode.tsx`                           |
| Modify state/actions           | `state/store.ts`                             |
| Change API behavior            | `api/FakeCloudKotlinFunctionsApi.ts`         |
| Update connection logic        | `canBeConnected.ts`, `FunctionConnection.ts` |
| Modify function execution      | `FakeFunctionRunner.ts`, `canRun.ts`         |

## Entry Points

- **Root component**: `CloudFunctionsAntd.tsx`
- **State store**: `state/store.ts`
- **API interface**: `api/CloudKotlinFunctionsApi.ts`

## Documentation

- [Architecture](doc/architecture.md) - System overview and patterns
- [UI Components](doc/ui-components.md) - Component reference
- [Storage](doc/storage.md) - State management and persistence
- [Main Flows](doc/main-flows.md) - Key user interactions

## File Structure

```
cloudFunctionsAntd/
├── CloudFunctionsAntd.tsx    # Root component
├── FunctionsFlowComponent.tsx # ReactFlow canvas
├── FunctionNode.tsx          # Node rendering
├── state/store.ts            # Zustand store
├── api/                      # API layer
├── dto/                      # Data transfer objects
├── db/LocalDb.ts             # localStorage wrapper
└── doc/                      # Documentation
```
