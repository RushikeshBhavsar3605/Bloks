# Socket.IO Architecture Documentation

This directory contains the restructured Socket.IO implementation that was previously a single 883-line file. The code has been divided into logical, maintainable modules.

## File Structure

```
pages/api/socket/
├── io.ts                           # Main entry point (simplified)
├── socket-manager.ts               # Main SocketDocumentManager class
├── types.ts                        # All socket-related TypeScript types
├── README.md                       # This documentation
├── managers/
│   ├── document-save-manager.ts    # Document save debouncing & persistence
│   └── room-manager.ts             # Room joining/leaving logic
└── handlers/
    ├── document-events.ts          # Document CRUD operations
    └── collaboration-events.ts     # Real-time collaboration features
```

## Module Responsibilities

### `io.ts` - Main Entry Point (16 lines)
- Socket.IO server initialization
- Connection handling and authentication
- Imports and orchestrates all other modules

### `socket-manager.ts` - Main Orchestrator (107 lines)
- Coordinates between different handlers and managers
- Manages socket event listeners
- Handles disconnect cleanup
- Maintains active room state

### `managers/document-save-manager.ts` - Save Management (127 lines)
- **Purpose**: Debounced document saving to prevent excessive database writes
- **Features**:
  - 2-second debounce for document saves
  - Tracks pending changes per document
  - Emits save status events to users
  - Handles save errors gracefully

### `managers/room-manager.ts` - Room Management (174 lines)
- **Purpose**: Handles Socket.IO room operations
- **Features**:
  - Document room subscriptions (sidebar)
  - Active document room subscriptions (editor presence)
  - Access verification before joining rooms
  - Cleanup on room leave

### `handlers/document-events.ts` - Document Operations (120 lines)
- **Purpose**: Handles document metadata and content updates
- **Features**:
  - Title and icon updates
  - Content updates with authorization
  - Debounced save triggering
  - Permission validation

### `handlers/collaboration-events.ts` - Real-time Collaboration (164 lines)
- **Purpose**: Manages live collaboration features
- **Features**:
  - Document header changes broadcasting
  - Real-time content changes (TipTap steps)
  - Cursor position updates
  - Collaborator presence management

### `types.ts` - Type Definitions (48 lines)
- Centralized TypeScript types for all socket events
- Ensures type safety across modules
- Makes the API contract clear

## Benefits of This Structure

### 🎯 **Single Responsibility**
Each module has a clear, focused purpose making it easier to understand and maintain.

### 🧪 **Testability** 
Smaller, isolated modules are much easier to unit test individually.

### 🔧 **Maintainability**
Changes to one feature (e.g., save logic) don't affect others (e.g., collaboration).

### 📖 **Readability**
Developers can quickly locate relevant code without scrolling through 800+ lines.

### 🔒 **Type Safety**
Centralized types ensure consistency and catch errors at compile time.

## Key Patterns Used

### **Manager Pattern**
- `DocumentSaveManager`: Singleton for global save state management
- `RoomManager`: Handles room lifecycle operations

### **Handler Pattern**
- `DocumentEventHandler`: Processes document-related events
- `CollaborationEventHandler`: Manages real-time collaboration

### **Dependency Injection**
- Handlers receive socket, io, and utility functions as constructor parameters
- Makes testing easier and reduces coupling

### **Event-Driven Architecture**
- Clear separation between event handling and business logic
- Each handler focuses on specific event types

## Migration Notes

This refactoring maintains 100% backward compatibility:
- All existing socket events work exactly the same
- No changes required to client-side code
- Same external API and behavior
- Preserved all error handling and logging

## Future Improvements

With this structure, future enhancements become much easier:

1. **Add Unit Tests**: Each module can be tested independently
2. **Add Metrics**: Easy to add monitoring to specific handlers
3. **Performance Optimization**: Can optimize individual components
4. **Feature Addition**: New collaboration features can be added to specific handlers
5. **Error Handling**: Centralized error handling can be improved per module

## Development Guidelines

When working with this code:

1. **Keep modules focused**: Don't add unrelated functionality to existing modules
2. **Use the type system**: Always import types from `types.ts`
3. **Handle errors gracefully**: Each module should handle its own errors appropriately
4. **Maintain consistency**: Follow the established patterns when adding new features
5. **Document changes**: Update this README when adding new modules or changing architecture