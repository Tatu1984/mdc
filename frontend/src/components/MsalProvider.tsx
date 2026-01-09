"use client";

import { ReactNode, useEffect, useState, createContext, useContext, useRef } from "react";
import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from "@azure/msal-browser";
import { getMsalConfig } from "@/config/authConfig";

// Context to track MSAL initialization state
const MsalInitContext = createContext<{ isInitialized: boolean }>({ isInitialized: false });

export function useMsalInit() {
  return useContext(MsalInitContext);
}

// Singleton instance to prevent duplicate MSAL instances during hot reloading
let msalInstanceSingleton: PublicClientApplication | null = null;
let msalInitPromise: Promise<PublicClientApplication> | null = null;

const getMsalInstance = async (): Promise<PublicClientApplication> => {
  // Return existing instance if available
  if (msalInstanceSingleton) {
    return msalInstanceSingleton;
  }

  // Return existing initialization promise if in progress
  if (msalInitPromise) {
    return msalInitPromise;
  }

  // Create new initialization promise
  msalInitPromise = (async () => {
    const instance = new PublicClientApplication(getMsalConfig());
    await instance.initialize();

    // Handle redirect promise after login
    try {
      const response = await instance.handleRedirectPromise();
      if (response) {
        instance.setActiveAccount(response.account);
      }
    } catch (error) {
      console.error("Redirect error:", error);
    }

    // Set active account on login success
    instance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        instance.setActiveAccount(payload.account);
      }
    });

    // Check if there are already accounts in the cache
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }

    msalInstanceSingleton = instance;
    return instance;
  })();

  return msalInitPromise;
};

interface MsalProviderProps {
  children: ReactNode;
}

export default function MsalProvider({ children }: MsalProviderProps) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(msalInstanceSingleton);
  const [isInitialized, setIsInitialized] = useState(!!msalInstanceSingleton);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initRef.current) return;
    initRef.current = true;

    // If already initialized, skip
    if (msalInstanceSingleton) {
      setMsalInstance(msalInstanceSingleton);
      setIsInitialized(true);
      return;
    }

    const initializeMsal = async () => {
      const instance = await getMsalInstance();
      setMsalInstance(instance);
      setIsInitialized(true);
    };

    initializeMsal();
  }, []);

  // Always wrap with context, but only wrap with MSAL provider when initialized
  if (!isInitialized || !msalInstance) {
    return (
      <MsalInitContext.Provider value={{ isInitialized: false }}>
        {children}
      </MsalInitContext.Provider>
    );
  }

  return (
    <MsalInitContext.Provider value={{ isInitialized: true }}>
      <MsalReactProvider instance={msalInstance}>
        {children}
      </MsalReactProvider>
    </MsalInitContext.Provider>
  );
}
