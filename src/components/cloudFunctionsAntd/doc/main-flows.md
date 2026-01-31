# Main Flows

## App Initialization

```
CloudFunctionsAntd mounts
  → api.getNamespaces()
  → upsertNamespaces()
  → NamespacesPanel auto-selects first namespace
  → subscribeToEvents() starts listening
```

**Files**: `CloudFunctionsAntd.tsx:69-82`, `state/store.ts`

## Create Function

```
User clicks "New Function"
  → CreateFunctionModal opens
  → User enters Kotlin code
  → api.createFunction()
  → API emits 'function:created' event
  → subscribeToEvents() → addFunction()
  → UI updates
```

**Files**: `MenuPanel.tsx`, `CreateFunctionModal.tsx`, `api/FakeCloudKotlinFunctionsApi.ts`

## Connect Functions

```
User drags from output handle to input handle
  → canBeConnected() validates types
  → addConnection() updates store
  → api.addConnection() persists
  → getEdges() recomputes ReactFlow edges
```

**Files**: `FunctionsFlowComponent.tsx`, `canBeConnected.ts`, `state/store.ts:212-229`

## Run Function

```
User clicks Run button
  → runFunction(functionId)
  → canRun() validates (all args connected, upstream idle)
  → setFunctionState('running')
  → api.runFunction()
  → FakeFunctionRunner executes
  → API emits execution log events
  → UI shows results in CallGroupPanel
```

**Files**: `state/store.ts:179-209`, `canRun.ts`, `FakeFunctionRunner.ts`, `CallGroupPanel.tsx`

## Delete Function

```
User clicks Delete
  → deleteFunction() removes from store
  → api.deleteFunction() removes from persistence
  → Connections involving function auto-removed
```

**Files**: `CloudFunctionsAntd.tsx:112-119`, `state/store.ts:152-164`

## Common Modifications

| Task                      | Where to look                                                  |
|---------------------------|----------------------------------------------------------------|
| Change run validation     | `canRun.ts`                                                    |
| Change type compatibility | `canBeConnected.ts`                                            |
| Change execution behavior | `FakeFunctionRunner.ts`                                        |
| Change Kotlin parsing     | `api/parseKotlinFunction.ts`                                   |
| Add new event type        | `api/CloudKotlinFunctionsApi.ts`, `state/subscribeToEvents.ts` |
