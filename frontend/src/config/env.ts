/**
 * Runtime environment configuration
 *
 * This allows environment variables to be overridden at runtime in containerized deployments.
 * At build time, NEXT_PUBLIC_* variables are used as defaults.
 * At runtime, window.__ENV__ can override these values.
 */

// Type for runtime environment
interface RuntimeEnv {
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_MSAL_CLIENT_ID?: string;
  NEXT_PUBLIC_MSAL_AUTHORITY?: string;
  NEXT_PUBLIC_MSAL_REDIRECT_URI?: string;
  NEXT_PUBLIC_API_SCOPE?: string;
}

// Get runtime env from window (injected by server) or fall back to build-time env
const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__ as RuntimeEnv;
  }
  return {};
};

// Helper to get env variable with runtime override support
const getEnv = (key: keyof RuntimeEnv, defaultValue: string = ''): string => {
  const runtimeEnv = getRuntimeEnv();
  const runtimeValue = runtimeEnv[key];

  // Runtime env takes precedence (if non-empty), then build-time env, then default
  // Check for non-empty string since env-config.js may have empty strings
  if (runtimeValue && runtimeValue.trim() !== '') {
    return runtimeValue;
  }

  return process.env[key] || defaultValue;
};

// Export environment configuration
export const env = {
  get API_URL() {
    return getEnv('NEXT_PUBLIC_API_URL', 'https://localhost:7078');
  },
  get MSAL_CLIENT_ID() {
    return getEnv('NEXT_PUBLIC_MSAL_CLIENT_ID', '');
  },
  get MSAL_AUTHORITY() {
    return getEnv('NEXT_PUBLIC_MSAL_AUTHORITY', '');
  },
  get MSAL_REDIRECT_URI() {
    return getEnv('NEXT_PUBLIC_MSAL_REDIRECT_URI', 'http://localhost:3000/');
  },
  get API_SCOPE() {
    return getEnv('NEXT_PUBLIC_API_SCOPE', '');
  },
};

export default env;
