import React from 'react'
import { AppWrapper } from "@/components/common/PageMeta.tsx";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client.ts";
import { PermissionProvider } from "@/context/PermissionContext.tsx";

const Provider = ({children}: {children: React.ReactNode}) => {
  return (
      <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppWrapper>
              <PermissionProvider>
                {children}
              </PermissionProvider>
            </AppWrapper>
          </ThemeProvider>
        </QueryClientProvider>
          )
}

export default Provider