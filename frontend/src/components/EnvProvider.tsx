"use client";

import { ReactNode, createContext, useContext } from "react";

interface RuntimeEnv {
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_MSAL_CLIENT_ID?: string;
  NEXT_PUBLIC_MSAL_AUTHORITY?: string;
  NEXT_PUBLIC_MSAL_REDIRECT_URI?: string;
  NEXT_PUBLIC_API_SCOPE?: string;
}

interface EnvContextType {
  isLoaded: boolean;
  env: RuntimeEnv;
}

// Get runtime env from window (injected by /env-config.js script)
const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__ as RuntimeEnv;
  }
  return {};
};

const EnvContext = createContext<EnvContextType>({
  isLoaded: true,
  env: getRuntimeEnv()
});

export function useEnv() {
  return useContext(EnvContext);
}

interface EnvProviderProps {
  children: ReactNode;
}

/**
 * Environment Provider
 * The env-config.js script is loaded synchronously in the HTML head,
 * so window.__ENV__ is available immediately when this component renders.
 */
export default function EnvProvider({ children }: EnvProviderProps) {
  const env = getRuntimeEnv();

  return (
    <EnvContext.Provider value={{ isLoaded: true, env }}>
      {children}
    </EnvContext.Provider>
  );
}
