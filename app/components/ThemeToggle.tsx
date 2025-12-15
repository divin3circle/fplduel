"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="p-3 rounded-full bg-background border shadow-lg hover:bg-accent transition-colors"
            aria-label="Theme toggle"
            title={`Current theme: ${currentTheme.label}`}
          >
            <CurrentIcon className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          className="w-40 p-2 rounded-2xl shadow-none"
          sideOffset={8}
        >
          <div className="flex flex-col gap-1">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-2xl text-sm transition-colors font-sans font-medium",
                  "hover:bg-accent",
                  theme === value && "bg-accent font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
