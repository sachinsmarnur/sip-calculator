import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="h-9 w-9 rounded-xl bg-sidebar-accent flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-sidebar-foreground/60" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 flex items-center justify-center transition-all duration-300 group"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-sidebar-foreground/80 group-hover:text-yellow-400 transition-colors duration-300 group-hover:rotate-45 transform" />
      ) : (
        <Moon className="h-4 w-4 text-sidebar-foreground/80 group-hover:text-blue-300 transition-colors duration-300 group-hover:-rotate-12 transform" />
      )}
    </button>
  );
}
