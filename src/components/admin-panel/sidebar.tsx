"use client";

import { Menu } from "~/components/admin-panel/menu";
import { SidebarToggle } from "~/components/admin-panel/sidebar-toggle";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/hooks/use-sidebar";
import { useStore } from "~/hooks/use-store";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { Icons } from "../icons";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { toggleOpen, getOpenState, setIsHover, settings } = sidebar;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={getOpenState()} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800 overflow-x-hidden"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="mb-2">
            <Icons.rosneft className={cn(
              "w-32 h-10 pb-1 dark:[&_.text]:fill-foreground [&_.text]:transition-all [&_.text]:duration-300 transition-all duration-300",
              !getOpenState()
                ? "translate-x-[33px] [&_.text]:opacity-0"
                : "translate-x-0 [&_.text]:opacity-100"
            )}/>
          </Link>
        </Button>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
