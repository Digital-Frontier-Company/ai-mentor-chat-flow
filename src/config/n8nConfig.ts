
/**
 * Configuration for n8n chat integration
 */

export interface N8nConfig {
  webhookUrl: string;
  enabled: boolean;
  fallbackToEdgeFunction: boolean;
  timeout: number;
}

export const N8N_CONFIG: N8nConfig = {
  // Replace with your actual n8n webhook URL
  webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  enabled: import.meta.env.VITE_N8N_ENABLED === 'true' || false,
  fallbackToEdgeFunction: true,
  timeout: 30000, // 30 seconds
};

// Feature flag for n8n integration
export const useN8nIntegration = () => {
  return N8N_CONFIG.enabled && N8N_CONFIG.webhookUrl;
};
