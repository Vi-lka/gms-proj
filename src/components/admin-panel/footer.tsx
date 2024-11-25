"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useStore } from "~/hooks/use-store";
import { useSidebar } from "~/hooks/use-sidebar";

export function Footer() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings, isOpen, setSettings, toggleOpen } = sidebar;

  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <TooltipProvider>
          <div className="lg:flex gap-6 hidden">
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-hover-open"
                    onCheckedChange={(x) => {
                      if (isOpen && !settings.isHoverOpen) toggleOpen()
                      if (!isOpen && settings.isHoverOpen) toggleOpen()
                      setSettings({ isHoverOpen: x })
                    }}
                    checked={settings.isHoverOpen}
                  />
                  <Label htmlFor="is-hover-open">Hover</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent align="start" sideOffset={6}>
                <p>При наведении на боковую панель в мини-состоянии она откроется.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
