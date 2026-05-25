"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface MobileNavCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const MobileNavContext = createContext<MobileNavCtx>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useMobileNav() {
  return useContext(MobileNavContext);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <MobileNavContext.Provider value={{ isOpen, open, close }}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile nav overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={close}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 md:hidden ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar mobile onClose={close} />
        </div>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </MobileNavContext.Provider>
  );
}
