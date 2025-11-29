export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;
  day?: number; // Which day's agent to run

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
  companyName: 'Razorpay SDR',
  pageTitle: 'Sales Development Representative',
  pageDescription: 'Razorpay - Accept Payments, Grow Your Business',
  day: 5,

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#1f2937',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#4b5563',
  startButtonText: 'Start Your Journey',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};
