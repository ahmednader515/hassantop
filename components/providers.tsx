"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { Toaster } from "sonner";
import { RTLProvider } from "@/components/providers/rtl-provider";
import { ThemeProvider as BrandThemeProvider } from "@/components/theme-provider";
import { TenantProvider } from "@/components/providers/tenant-provider";
import { NavigationProvider } from "@/lib/contexts/navigation-context";
import { SessionMonitor } from "@/components/session-monitor";
import { useEffect } from "react";
import type { CurrentTenant } from "@/types/tenant";

// Component to handle session loading states
const SessionHandler = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Log session status for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Session status:", status, "Session:", session);
    }
  }, [session, status]);

  return <>{children}</>;
};

export const Providers = ({
  children,
  tenant = null,
}: {
  children: React.ReactNode;
  /** Resolved by root layout via getCurrentTenant(); optional for backwards compatibility. */
  tenant?: CurrentTenant | null;
}) => {
  return (
    <SessionProvider
      refetchInterval={0} // Disable automatic refetching
      refetchOnWindowFocus={false} // Disable refetch on window focus
      refetchWhenOffline={false} // Don't refetch when offline
      refetchOnMount={true} // ✅ Important: Refetch on mount
    >
      <SessionHandler>
        <TenantProvider tenant={tenant}>
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
        </TenantProvider>
      </SessionHandler>
    </SessionProvider>
  );
}; 