"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { Toaster } from "sonner";
import { RTLProvider } from "@/components/providers/rtl-provider";
import { ThemeProvider as BrandThemeProvider } from "@/components/theme-provider";
import { NavigationProvider } from "@/lib/contexts/navigation-context";
import { SessionMonitor } from "@/components/session-monitor";
import { useEffect } from "react";

const SessionHandler = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Session status:", status, "Session:", session);
    }
  }, [session, status]);

  return <>{children}</>;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchOnMount={true}
    >
      <SessionHandler>
        <RTLProvider>
          <BrandThemeProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              storageKey="the-giant-theme"
              disableTransitionOnChange
            >
              <NavigationProvider>
                <ToastProvider />
                <SessionMonitor />
                {children}
                <Toaster />
              </NavigationProvider>
            </ThemeProvider>
          </BrandThemeProvider>
        </RTLProvider>
      </SessionHandler>
    </SessionProvider>
  );
};
