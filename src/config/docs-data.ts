import { LayoutDashboardIcon, FileTextIcon, CalendarIcon, SparklesIcon, DatabaseIcon, Settings2Icon } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  route: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: string;
}

export interface DocsData {
  checklist: ChecklistItem[];
  features: FeatureItem[];
}

export const docsData: DocsData = {
  checklist: [
    { id: 'email', label: 'Connect Email Account', route: '/settings/integrations' },
    { id: 'calendar', label: 'Connect Calendar', route: '/calendar' },
    { id: 'profile', label: 'Configure Profile Settings', route: '/settings/profile' },
    { id: 'firstBriefing', label: 'Generate First Briefing', route: '/briefly' },
    { id: 'inbox', label: 'Review Inbox', route: '/inbox' },
    { id: 'schedule', label: 'Schedule Recurring Briefings', route: '/briefly/schedule' },
  ],
  features: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: null, // placeholder, will be rendered in component
      description: 'View account activity, monitor statistics, access recent activity.',
      content: 'The Dashboard provides an overview of your account activity, key metrics, and quick access to recent items.',
    },
    {
      id: 'inbox',
      title: 'Inbox',
      icon: null, // placeholder
      description: 'Manage incoming content, read summaries, organize communications.',
      content: 'Inbox lets you view and organize incoming emails, documents, and AI‑generated summaries.',
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: null, // placeholder
      description: 'View upcoming events, manage schedules, generate schedule‑aware briefings.',
      content: 'Calendar integration displays events, allows scheduling, and powers time‑based briefings.',
    },
    {
      id: 'briefly',
      title: 'Briefly',
      icon: null, // placeholder
      description: 'Generate AI briefings, customize preferences, schedule automatic briefings.',
      content: 'Briefly creates AI‑powered summaries of your selected sources with customizable settings.',
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: null, // placeholder
      description: 'Connect external services, manage connected accounts.',
      content: 'Integrations let you link Gmail, Google Calendar, and other third‑party services.',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: null, // placeholder
      description: 'Profile management, notifications, personal preferences.',
      content: 'Settings allows you to edit profile details, notification preferences, and other options.',
    },
  ],
};
