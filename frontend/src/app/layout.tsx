'use client'

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import KeycloakProvider from '@/components/KeycloakProvider'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Pages that don't require the sidebar layout
const publicRoutes = ['/get-started']

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  const isPublicRoute = publicRoutes.includes(pathname)

  // Show loading state while checking auth (only for non-public routes)
  if (!isPublicRoute && isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </main>
    )
  }

  // For public routes or when not authenticated, show simple layout
  if (isPublicRoute || !isAuthenticated) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }

  // For authenticated users, show full sidebar layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <KeycloakProvider>
          <TooltipProvider>
            <LayoutContent>{children}</LayoutContent>
          </TooltipProvider>
        </KeycloakProvider>
      </body>
    </html>
  )
}
