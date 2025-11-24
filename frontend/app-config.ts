export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // for LiveKit Cloud Sandbox
  sandboxId?: string;
  agentName?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Wellness Companion',
  pageTitle: 'Health & Wellness Voice Companion',
  pageDescription: 'Daily wellness check-ins via voice AI',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#dc2626',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#ef4444',
  startButtonText: 'Start Check-in',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};
