import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigation
export type MainTabParamList = {
  DashboardTab: undefined;
  EntriesTab: undefined;
  ProjectsTab: undefined;
  ReportsTab: undefined;
  MoreTab: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
};

// Clients Stack
export type ClientsStackParamList = {
  Clients: undefined;
  ClientDetail: { clientId: string };
};

// Projects Stack
export type ProjectsStackParamList = {
  Projects: undefined;
  ProjectDetail: { projectId: string };
  ClientDetail: { clientId: string };
  CreateProject: undefined;
  EditProject: { projectId: string };
};

// Entries Stack
export type EntriesStackParamList = {
  Entries: undefined;
  EntryDetail: { entryId: string };
  CreateEntry: undefined;
  EditEntry: { entryId: string };
};

// Reports Stack
export type ReportsStackParamList = {
  Reports: undefined;
};

// Invoices Stack
export type InvoicesStackParamList = {
  Invoices: undefined;
  InvoiceDetail: { invoiceId: string };
};

// Settings/More Stack
export type MoreStackParamList = {
  More: undefined;
  Profile: undefined;
  Clients: undefined;
  ClientDetail: { clientId: string };
  Projects: undefined;
  ProjectDetail: { projectId: string };
  Invoices: undefined;
  InvoiceDetail: { invoiceId: string };
  Settings: undefined;
  Preferences: undefined;
  Subscription: undefined;
  Referrals: undefined;
  About: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type DashboardScreenProps<T extends keyof DashboardStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DashboardStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type ProjectsScreenProps<T extends keyof ProjectsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProjectsStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type EntriesScreenProps<T extends keyof EntriesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EntriesStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type ReportsScreenProps<T extends keyof ReportsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ReportsStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type MoreScreenProps<T extends keyof MoreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MoreStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;
