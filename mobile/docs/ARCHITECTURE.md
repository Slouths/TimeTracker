# TradeTimer Mobile - Architecture

Technical architecture and design decisions for the TradeTimer mobile application.

## Architecture Overview

The app follows a modular, scalable architecture based on React Native and Expo best practices.

```
┌─────────────────────────────────────────────┐
│              User Interface                  │
│         (React Native Components)            │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│           Navigation Layer                   │
│        (React Navigation v6)                 │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│         State Management Layer               │
│              (Zustand)                       │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│          Services Layer                      │
│    (Supabase, Stripe, Analytics)            │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│         Data Persistence                     │
│   (Supabase DB + AsyncStorage)              │
└─────────────────────────────────────────────┘
```

## Core Technologies

### Framework: Expo + React Native

**Why Expo?**
- Simplified build process
- Over-the-air updates
- Easy access to native APIs
- Great developer experience

**Version:** Expo SDK 52, React Native 0.76

### Language: TypeScript

**Benefits:**
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

### Navigation: React Navigation v6

**Structure:**
- Stack Navigator for auth flow
- Tab Navigator for main app
- Type-safe navigation with TypeScript

### State Management: Zustand

**Why Zustand over Redux?**
- Simpler API
- Less boilerplate
- Better performance
- Smaller bundle size

**Stores:**
- `authStore` - User authentication state
- `timerStore` - Timer state (running, paused, elapsed time)
- `clientsStore` - Client data and CRUD operations
- `projectsStore` - Project data
- `settingsStore` - User settings and preferences

## Directory Structure

### `/src/components/`

Reusable UI components organized by domain:

- **`common/`** - Generic components (Button, Input, Card, etc.)
- **`auth/`** - Authentication-specific components
- **`timer/`** - Timer-related components
- **`clients/`** - Client management components
- **`entries/`** - Time entry components

**Component Guidelines:**
- Functional components only
- Use TypeScript for props
- Keep components small and focused
- Memoize when necessary

### `/src/screens/`

Full-screen views:

- **`auth/`** - Login, Signup, ForgotPassword
- **`timer/`** - Main timer screen
- **`clients/`** - Client list and details
- **`entries/`** - Time entries list
- **`settings/`** - Settings and preferences

**Screen Guidelines:**
- One screen per file
- Use navigation types
- Handle loading and error states
- Implement pull-to-refresh

### `/src/navigation/`

Navigation configuration:

- **`AppNavigator.tsx`** - Root navigator, switches between Auth and Main
- **`AuthNavigator.tsx`** - Stack navigator for auth flow
- **`MainTabNavigator.tsx`** - Bottom tab navigator for main app

**Navigation Pattern:**
```
AppNavigator
├── AuthNavigator (if not authenticated)
│   ├── Login
│   ├── Signup
│   └── ForgotPassword
└── MainTabNavigator (if authenticated)
    ├── TimerTab
    ├── EntriesTab
    ├── ClientsTab (Reports placeholder)
    └── SettingsTab (More)
```

### `/src/store/`

Zustand stores for state management.

**Store Pattern:**
```typescript
import { create } from 'zustand';

interface State {
  // State properties
  data: DataType[];
  isLoading: boolean;

  // Actions
  fetchData: () => Promise<void>;
  updateData: (id: string, updates: Partial<DataType>) => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  data: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    // Fetch logic
    set({ data: result, isLoading: false });
  },

  updateData: async (id, updates) => {
    // Update logic
  },
}));
```

### `/src/services/`

External service integrations:

- **`supabase/`** - Database and authentication
  - `client.ts` - Supabase client configuration
  - `auth.ts` - Authentication methods
  - `database.ts` - Database operations

- **`stripe/`** - Payment processing (future)
- **`analytics/`** - PostHog integration (future)
- **`notifications/`** - Push notifications (future)

### `/src/hooks/`

Custom React hooks:

- `useBiometric.ts` - Biometric authentication
- `useNetworkStatus.ts` - Network connectivity
- `useTimer.ts` - Timer functionality
- `useOffline.ts` - Offline support

**Hook Pattern:**
```typescript
export const useCustomHook = () => {
  const [state, setState] = useState();

  useEffect(() => {
    // Side effects
  }, []);

  return {
    state,
    actions,
  };
};
```

### `/src/utils/`

Utility functions:

- `format.ts` - Formatting (currency, time, dates)
- `validation.ts` - Input validation
- `storage.ts` - AsyncStorage helpers
- `time.ts` - Time calculations

**Utility Guidelines:**
- Pure functions
- Well-tested
- Documented with JSDoc

### `/src/constants/`

App-wide constants:

- `theme.ts` - Design tokens (colors, spacing, fonts)
- `config.ts` - App configuration

**Theme Structure:**
```typescript
export const theme = {
  colors: { primary, secondary, ... },
  spacing: { xs, sm, md, lg, xl },
  fontSize: { xs, sm, md, lg, xl },
  borderRadius: { sm, md, lg },
  shadows: { sm, md, lg },
};
```

### `/src/types/`

TypeScript type definitions:

- `models.ts` - Data models (Client, Project, TimeEntry, etc.)
- `navigation.ts` - Navigation type definitions

## Data Flow

### Authentication Flow

```
1. User opens app
2. AppNavigator checks auth state (authStore)
3. If authenticated → MainTabNavigator
4. If not authenticated → AuthNavigator
5. User signs in → authStore.signIn()
6. Supabase validates → returns session
7. Session stored → authStore updates
8. AppNavigator switches to MainTabNavigator
```

### Timer Flow

```
1. User selects client
2. User starts timer → timerStore.start()
3. Timer ticks every second → updates elapsedSeconds
4. User can pause/resume
5. User stops timer → timerStore.stop()
6. Calculate duration and amount
7. Save to database → databaseService.createTimeEntry()
8. Refresh entries list
9. Reset timer state
```

### Data Fetching Flow

```
1. Screen mounts
2. Call store fetch method (e.g., clientsStore.fetchClients())
3. Set loading state
4. Call service method (databaseService.getClients())
5. Supabase query executes
6. Data returned
7. Store updated with data
8. Loading state cleared
9. UI re-renders with data
```

## State Management Patterns

### Local Component State

Use `useState` for:
- UI state (modals open/closed)
- Form inputs
- Temporary data

### Global State (Zustand)

Use stores for:
- User authentication
- Timer state
- Data from database
- App-wide settings

### Server State

Supabase handles:
- Persistent data
- Real-time updates (future)
- File storage (future)

## Performance Optimizations

### 1. Component Memoization

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

### 2. List Virtualization

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={21}
/>
```

### 3. Image Optimization

```typescript
<Image
  source={{ uri }}
  resizeMode="cover"
  style={styles.image}
/>
```

### 4. Debouncing

```typescript
const debouncedSearch = useDebounce(searchQuery, 300);
```

## Security

### 1. Authentication

- Supabase handles auth tokens
- Tokens stored in AsyncStorage (encrypted on iOS)
- Auto-refresh on expiry

### 2. Biometric Authentication

- Face ID / Touch ID for quick login
- Fallback to password
- User can disable in settings

### 3. Data Protection

- All API calls over HTTPS
- Row Level Security in Supabase
- No sensitive data in client code
- Environment variables for secrets

### 4. Error Handling

```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error:', error);
  // Handle error appropriately
}
```

## Offline Support

### Strategy

1. **AsyncStorage Cache**
   - Recent clients
   - Recent entries
   - User settings

2. **Queue Pending Actions**
   - Timer stops when offline
   - Saved to queue
   - Synced when online

3. **Network Detection**
   ```typescript
   import NetInfo from '@react-native-community/netinfo';

   NetInfo.addEventListener(state => {
     if (state.isConnected) {
       syncOfflineQueue();
     }
   });
   ```

## Testing Strategy

### Unit Tests (Future)

- Utility functions
- Store actions
- Validation logic

### Integration Tests (Future)

- API calls
- Navigation flows
- Component interactions

### E2E Tests (Future)

- Complete user flows
- Critical paths (sign up, timer, save entry)

## Build Process

### Development Build

```bash
npm start
```

### Production Build

```bash
eas build --platform ios
eas build --platform android
```

### Over-the-Air Updates

```bash
eas update --branch production
```

## Future Enhancements

### Planned Features

1. **Reports & Analytics**
   - Charts and visualizations
   - Export capabilities

2. **Invoices**
   - Generate PDFs
   - Email invoices

3. **Push Notifications**
   - Timer reminders
   - Invoice notifications

4. **Widgets**
   - Home screen timer widget
   - Quick start buttons

5. **Wear OS / watchOS**
   - Companion apps
   - Quick timer control

## Best Practices

### Code Style

- Use TypeScript strictly
- Follow ESLint rules
- Consistent naming conventions
- Comment complex logic

### Git Workflow

- Feature branches
- Meaningful commit messages
- Code review before merge

### Performance

- Avoid unnecessary re-renders
- Optimize images
- Lazy load when possible
- Monitor bundle size

## Conclusion

This architecture provides:
- Scalability for future features
- Maintainability with clear structure
- Performance through optimizations
- Type safety with TypeScript
- Great developer experience with Expo
