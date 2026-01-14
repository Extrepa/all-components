# Player State Sync Pipeline

```mermaid
flowchart LR
  Input[Local Input] --> Update[Avatar update]
  Update --> Serialize[PlayerState serialize()]
  Serialize --> Diff[Diff vs last state]
  Diff --> Send[Send delta to server]
  Server[Server/Host] --> Broadcast[Broadcast to peers]
  Broadcast --> Apply[Remote apply + interpolate]
```

## Notes
- Serialize position, rotation (quaternion), velocity, state/targetState, expression, colorVariant, movement flags, timestamp, and playerId.
- Use `diff()` for delta compression; fall back to full state if no previous snapshot.
- Remote clients should interpolate toward received transforms instead of snapping.
- Timestamps allow out-of-order handling and simple client-side reconciliation.
