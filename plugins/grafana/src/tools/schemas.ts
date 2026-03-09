import { z } from 'zod';

// --- User ---

export const userSchema = z.object({
  id: z.number().describe('User ID'),
  uid: z.string().describe('User UID'),
  login: z.string().describe('Username/login'),
  name: z.string().describe('Display name'),
  email: z.string().describe('Email address'),
  org_id: z.number().describe('Organization ID'),
  is_grafana_admin: z.boolean().describe('Whether user is a Grafana admin'),
  is_disabled: z.boolean().describe('Whether user is disabled'),
  avatar_url: z.string().describe('Avatar URL'),
  created_at: z.string().describe('ISO 8601 creation timestamp'),
  updated_at: z.string().describe('ISO 8601 last update timestamp'),
});

export interface RawUser {
  id?: number;
  uid?: string;
  login?: string;
  name?: string;
  email?: string;
  orgId?: number;
  isGrafanaAdmin?: boolean;
  isDisabled?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mapUser = (u: RawUser) => ({
  id: u.id ?? 0,
  uid: u.uid ?? '',
  login: u.login ?? '',
  name: u.name ?? '',
  email: u.email ?? '',
  org_id: u.orgId ?? 0,
  is_grafana_admin: u.isGrafanaAdmin ?? false,
  is_disabled: u.isDisabled ?? false,
  avatar_url: u.avatarUrl ?? '',
  created_at: u.createdAt ?? '',
  updated_at: u.updatedAt ?? '',
});

// --- Organization ---

export const orgSchema = z.object({
  id: z.number().describe('Organization ID'),
  name: z.string().describe('Organization name'),
  address1: z.string().describe('Address line 1'),
  address2: z.string().describe('Address line 2'),
  city: z.string().describe('City'),
  state: z.string().describe('State'),
  zip_code: z.string().describe('ZIP code'),
  country: z.string().describe('Country'),
});

export interface RawOrg {
  id?: number;
  name?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export const mapOrg = (o: RawOrg) => ({
  id: o.id ?? 0,
  name: o.name ?? '',
  address1: o.address?.address1 ?? '',
  address2: o.address?.address2 ?? '',
  city: o.address?.city ?? '',
  state: o.address?.state ?? '',
  zip_code: o.address?.zipCode ?? '',
  country: o.address?.country ?? '',
});

// --- Org Member ---

export const orgMemberSchema = z.object({
  user_id: z.number().describe('User ID'),
  uid: z.string().describe('User UID'),
  login: z.string().describe('Username/login'),
  name: z.string().describe('Display name'),
  email: z.string().describe('Email address'),
  role: z.string().describe('Role in organization (Admin, Editor, Viewer)'),
  last_seen_at: z.string().describe('ISO 8601 timestamp of last activity'),
  is_disabled: z.boolean().describe('Whether user is disabled'),
});

export interface RawOrgMember {
  userId?: number;
  uid?: string;
  login?: string;
  name?: string;
  email?: string;
  role?: string;
  lastSeenAt?: string;
  isDisabled?: boolean;
}

export const mapOrgMember = (m: RawOrgMember) => ({
  user_id: m.userId ?? 0,
  uid: m.uid ?? '',
  login: m.login ?? '',
  name: m.name ?? '',
  email: m.email ?? '',
  role: m.role ?? '',
  last_seen_at: m.lastSeenAt ?? '',
  is_disabled: m.isDisabled ?? false,
});

// --- Quota ---

export const quotaSchema = z.object({
  target: z.string().describe('Quota target (e.g., "dashboard", "data_source")'),
  limit: z.number().describe('Quota limit (-1 = unlimited)'),
  used: z.number().describe('Current usage'),
});

export interface RawQuota {
  target?: string;
  limit?: number;
  used?: number;
}

export const mapQuota = (q: RawQuota) => ({
  target: q.target ?? '',
  limit: q.limit ?? 0,
  used: q.used ?? 0,
});

// --- Dashboard search result ---

export const dashboardSearchSchema = z.object({
  id: z.number().describe('Dashboard numeric ID'),
  uid: z.string().describe('Dashboard UID (used in API calls)'),
  title: z.string().describe('Dashboard title'),
  url: z.string().describe('Dashboard URL path'),
  type: z.string().describe('Type: "dash-db" for dashboards, "dash-folder" for folders'),
  tags: z.array(z.string()).describe('Dashboard tags'),
  is_starred: z.boolean().describe('Whether the dashboard is starred by current user'),
  folder_uid: z.string().describe('Parent folder UID'),
  folder_title: z.string().describe('Parent folder title'),
});

export interface RawDashboardSearch {
  id?: number;
  uid?: string;
  title?: string;
  url?: string;
  type?: string;
  tags?: string[];
  isStarred?: boolean;
  folderUid?: string;
  folderTitle?: string;
}

export const mapDashboardSearch = (d: RawDashboardSearch) => ({
  id: d.id ?? 0,
  uid: d.uid ?? '',
  title: d.title ?? '',
  url: d.url ?? '',
  type: d.type ?? '',
  tags: d.tags ?? [],
  is_starred: d.isStarred ?? false,
  folder_uid: d.folderUid ?? '',
  folder_title: d.folderTitle ?? '',
});

// --- Dashboard (full) ---

export const dashboardSchema = z.object({
  uid: z.string().describe('Dashboard UID'),
  title: z.string().describe('Dashboard title'),
  url: z.string().describe('Dashboard URL path'),
  version: z.number().describe('Dashboard version number'),
  folder_uid: z.string().describe('Parent folder UID'),
  folder_title: z.string().describe('Parent folder title'),
  created: z.string().describe('ISO 8601 creation timestamp'),
  updated: z.string().describe('ISO 8601 last update timestamp'),
  created_by: z.string().describe('Creator username'),
  updated_by: z.string().describe('Last updater username'),
  can_save: z.boolean().describe('Whether current user can save this dashboard'),
  can_edit: z.boolean().describe('Whether current user can edit this dashboard'),
  can_admin: z.boolean().describe('Whether current user has admin access'),
  can_delete: z.boolean().describe('Whether current user can delete this dashboard'),
  tags: z.array(z.string()).describe('Dashboard tags'),
  panel_count: z.number().describe('Number of panels in the dashboard'),
});

interface RawDashboardMeta {
  url?: string;
  version?: number;
  folderUid?: string;
  folderTitle?: string;
  created?: string;
  updated?: string;
  createdBy?: string;
  updatedBy?: string;
  canSave?: boolean;
  canEdit?: boolean;
  canAdmin?: boolean;
  canDelete?: boolean;
}

interface RawDashboardModel {
  uid?: string;
  title?: string;
  tags?: string[];
  panels?: unknown[];
}

export interface RawDashboardResponse {
  meta?: RawDashboardMeta;
  dashboard?: RawDashboardModel;
}

export const mapDashboard = (r: RawDashboardResponse) => ({
  uid: r.dashboard?.uid ?? '',
  title: r.dashboard?.title ?? '',
  url: r.meta?.url ?? '',
  version: r.meta?.version ?? 0,
  folder_uid: r.meta?.folderUid ?? '',
  folder_title: r.meta?.folderTitle ?? '',
  created: r.meta?.created ?? '',
  updated: r.meta?.updated ?? '',
  created_by: r.meta?.createdBy ?? '',
  updated_by: r.meta?.updatedBy ?? '',
  can_save: r.meta?.canSave ?? false,
  can_edit: r.meta?.canEdit ?? false,
  can_admin: r.meta?.canAdmin ?? false,
  can_delete: r.meta?.canDelete ?? false,
  tags: r.dashboard?.tags ?? [],
  panel_count: r.dashboard?.panels?.length ?? 0,
});

// --- Folder ---

export const folderSchema = z.object({
  id: z.number().describe('Folder numeric ID'),
  uid: z.string().describe('Folder UID'),
  title: z.string().describe('Folder title'),
  url: z.string().describe('Folder URL path'),
  created: z.string().describe('ISO 8601 creation timestamp'),
  updated: z.string().describe('ISO 8601 last update timestamp'),
  created_by: z.string().describe('Creator username'),
  updated_by: z.string().describe('Last updater username'),
});

export interface RawFolder {
  id?: number;
  uid?: string;
  title?: string;
  url?: string;
  created?: string;
  updated?: string;
  createdBy?: string;
  updatedBy?: string;
}

export const mapFolder = (f: RawFolder) => ({
  id: f.id ?? 0,
  uid: f.uid ?? '',
  title: f.title ?? '',
  url: f.url ?? '',
  created: f.created ?? '',
  updated: f.updated ?? '',
  created_by: f.createdBy ?? '',
  updated_by: f.updatedBy ?? '',
});

// --- Data Source ---

export const datasourceSchema = z.object({
  id: z.number().describe('Data source numeric ID'),
  uid: z.string().describe('Data source UID'),
  name: z.string().describe('Data source name'),
  type: z.string().describe('Data source type (e.g., "prometheus", "loki")'),
  type_name: z.string().describe('Human-readable data source type name'),
  url: z.string().describe('Data source URL'),
  is_default: z.boolean().describe('Whether this is the default data source'),
  read_only: z.boolean().describe('Whether the data source is read-only'),
  access: z.string().describe('Access mode ("proxy" or "direct")'),
});

export interface RawDatasource {
  id?: number;
  uid?: string;
  name?: string;
  type?: string;
  typeName?: string;
  url?: string;
  isDefault?: boolean;
  readOnly?: boolean;
  access?: string;
}

export const mapDatasource = (d: RawDatasource) => ({
  id: d.id ?? 0,
  uid: d.uid ?? '',
  name: d.name ?? '',
  type: d.type ?? '',
  type_name: d.typeName ?? '',
  url: d.url ?? '',
  is_default: d.isDefault ?? false,
  read_only: d.readOnly ?? false,
  access: d.access ?? '',
});

// --- Alert Rule ---

export const alertRuleSchema = z.object({
  id: z.number().describe('Alert rule ID'),
  uid: z.string().describe('Alert rule UID'),
  title: z.string().describe('Alert rule title'),
  condition: z.string().describe('Alert condition reference'),
  folder_uid: z.string().describe('Parent folder UID'),
  rule_group: z.string().describe('Rule group name'),
  exec_err_state: z.string().describe('Error state behavior'),
  no_data_state: z.string().describe('No data state behavior'),
  for_duration: z.string().describe('Duration before alert fires (e.g., "5m")'),
  is_paused: z.boolean().describe('Whether the rule is paused'),
  updated: z.string().describe('ISO 8601 last update timestamp'),
});

export interface RawAlertRule {
  id?: number;
  uid?: string;
  title?: string;
  condition?: string;
  folderUID?: string;
  ruleGroup?: string;
  execErrState?: string;
  noDataState?: string;
  for?: string;
  isPaused?: boolean;
  updated?: string;
}

export const mapAlertRule = (r: RawAlertRule) => ({
  id: r.id ?? 0,
  uid: r.uid ?? '',
  title: r.title ?? '',
  condition: r.condition ?? '',
  folder_uid: r.folderUID ?? '',
  rule_group: r.ruleGroup ?? '',
  exec_err_state: r.execErrState ?? '',
  no_data_state: r.noDataState ?? '',
  for_duration: r.for ?? '',
  is_paused: r.isPaused ?? false,
  updated: r.updated ?? '',
});

// --- Annotation ---

export const annotationSchema = z.object({
  id: z.number().describe('Annotation ID'),
  dashboard_id: z.number().describe('Dashboard numeric ID'),
  dashboard_uid: z.string().describe('Dashboard UID'),
  panel_id: z.number().describe('Panel ID'),
  text: z.string().describe('Annotation text'),
  tags: z.array(z.string()).describe('Annotation tags'),
  time: z.number().describe('Start time (epoch milliseconds)'),
  time_end: z.number().describe('End time (epoch milliseconds, 0 for point annotations)'),
  created: z.number().describe('Creation time (epoch milliseconds)'),
  updated: z.number().describe('Update time (epoch milliseconds)'),
});

export interface RawAnnotation {
  id?: number;
  dashboardId?: number;
  dashboardUID?: string;
  panelId?: number;
  text?: string;
  tags?: string[];
  time?: number;
  timeEnd?: number;
  created?: number;
  updated?: number;
}

export const mapAnnotation = (a: RawAnnotation) => ({
  id: a.id ?? 0,
  dashboard_id: a.dashboardId ?? 0,
  dashboard_uid: a.dashboardUID ?? '',
  panel_id: a.panelId ?? 0,
  text: a.text ?? '',
  tags: a.tags ?? [],
  time: a.time ?? 0,
  time_end: a.timeEnd ?? 0,
  created: a.created ?? 0,
  updated: a.updated ?? 0,
});

// --- Team ---

export const teamSchema = z.object({
  id: z.number().describe('Team ID'),
  uid: z.string().describe('Team UID'),
  name: z.string().describe('Team name'),
  email: z.string().describe('Team email'),
  member_count: z.number().describe('Number of team members'),
  org_id: z.number().describe('Organization ID'),
});

export interface RawTeam {
  id?: number;
  uid?: string;
  name?: string;
  email?: string;
  memberCount?: number;
  orgId?: number;
}

export const mapTeam = (t: RawTeam) => ({
  id: t.id ?? 0,
  uid: t.uid ?? '',
  name: t.name ?? '',
  email: t.email ?? '',
  member_count: t.memberCount ?? 0,
  org_id: t.orgId ?? 0,
});

// --- Team Member ---

export const teamMemberSchema = z.object({
  user_id: z.number().describe('User ID'),
  login: z.string().describe('Username/login'),
  email: z.string().describe('Email address'),
  name: z.string().describe('Display name'),
  permission: z.number().describe('Permission level'),
});

export interface RawTeamMember {
  userId?: number;
  login?: string;
  email?: string;
  name?: string;
  permission?: number;
}

export const mapTeamMember = (m: RawTeamMember) => ({
  user_id: m.userId ?? 0,
  login: m.login ?? '',
  email: m.email ?? '',
  name: m.name ?? '',
  permission: m.permission ?? 0,
});

// --- Contact Point ---

export const contactPointSchema = z.object({
  uid: z.string().describe('Contact point UID'),
  name: z.string().describe('Contact point name'),
  type: z.string().describe('Contact point type (e.g., "email", "slack")'),
  disable_resolve_message: z.boolean().describe('Whether resolve messages are disabled'),
  provenance: z.string().describe('Provisioning provenance'),
});

export interface RawContactPoint {
  uid?: string;
  name?: string;
  type?: string;
  disableResolveMessage?: boolean;
  provenance?: string;
}

export const mapContactPoint = (c: RawContactPoint) => ({
  uid: c.uid ?? '',
  name: c.name ?? '',
  type: c.type ?? '',
  disable_resolve_message: c.disableResolveMessage ?? false,
  provenance: c.provenance ?? '',
});

// --- Service Account ---

export const serviceAccountSchema = z.object({
  id: z.number().describe('Service account ID'),
  uid: z.string().describe('Service account UID'),
  name: z.string().describe('Service account name'),
  login: z.string().describe('Service account login'),
  role: z.string().describe('Service account role'),
  is_disabled: z.boolean().describe('Whether the service account is disabled'),
  tokens: z.number().describe('Number of API tokens'),
});

export interface RawServiceAccount {
  id?: number;
  uid?: string;
  name?: string;
  login?: string;
  role?: string;
  isDisabled?: boolean;
  tokens?: number;
}

export const mapServiceAccount = (s: RawServiceAccount) => ({
  id: s.id ?? 0,
  uid: s.uid ?? '',
  name: s.name ?? '',
  login: s.login ?? '',
  role: s.role ?? '',
  is_disabled: s.isDisabled ?? false,
  tokens: s.tokens ?? 0,
});

// --- Snapshot ---

export const snapshotSchema = z.object({
  id: z.number().describe('Snapshot ID'),
  name: z.string().describe('Snapshot name'),
  key: z.string().describe('Snapshot key'),
  external: z.boolean().describe('Whether the snapshot is external'),
  expires: z.string().describe('Expiration timestamp'),
});

export interface RawSnapshot {
  id?: number;
  name?: string;
  key?: string;
  external?: boolean;
  expires?: string;
}

export const mapSnapshot = (s: RawSnapshot) => ({
  id: s.id ?? 0,
  name: s.name ?? '',
  key: s.key ?? '',
  external: s.external ?? false,
  expires: s.expires ?? '',
});
