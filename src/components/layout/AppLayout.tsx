import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { PageTransition } from "../PageTransition";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-primary/5">
        <AppSidebar />
        <SidebarInset className="relative z-10 flex-1">
          <Header />
          <main className="flex-1 p-4 sm:p-6">
            <PageTransition>
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </PageTransition>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}