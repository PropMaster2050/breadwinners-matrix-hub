import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-primary/5 transition-all duration-300">
        <AppSidebar />
        <SidebarInset className="transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-6 transition-all duration-300">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}