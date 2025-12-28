import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Laptop } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks properly on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium leading-none">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Select the theme for the dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg border">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-md transition-all ${
                    theme === "light"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Light Mode"
                >
                  <Sun className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-md transition-all ${
                    theme === "dark"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Dark Mode"
                >
                  <Moon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`p-2 rounded-md transition-all ${
                    theme === "system"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="System"
                >
                  <Laptop className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
