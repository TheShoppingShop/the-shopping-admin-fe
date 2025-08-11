import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 backdrop-blur px-3">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">TheShopping Admin</h1>
          </header>
          <main className="p-4">
            {children ?? <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
