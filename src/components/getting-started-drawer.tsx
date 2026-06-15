import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SearchIcon } from "lucide-react";
import { docsData, ChecklistItem, FeatureItem } from "@/config/docs-data";

// Placeholder hooks for dynamic completion detection – replace with real data hooks
function useEmailConnected() { return false; }
function useCalendarConnected() { return false; }
function useProfileConfigured() { return false; }
function useFirstBriefingExists() { return false; }
function useInboxAvailable() { return false; }
function useScheduledBriefingExists() { return false; }

export interface GettingStartedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GettingStartedDrawer({ open, onOpenChange }: GettingStartedDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Compute checklist completion status
  const completionMap: Record<string, boolean> = {
    email: useEmailConnected(),
    calendar: useCalendarConnected(),
    profile: useProfileConfigured(),
    firstBriefing: useFirstBriefingExists(),
    inbox: useInboxAvailable(),
    schedule: useScheduledBriefingExists(),
  };

  const completedCount = Object.values(completionMap).filter(Boolean).length;
  const totalCount = docsData.checklist.length;

  const filteredFeatures = docsData.features.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] bg-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-l-lg shadow-lg p-6">
        <SheetHeader className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 p-4 rounded-t-lg">
          <SheetTitle className="text-2xl font-bold animate-pulse">🚀 Getting Started</SheetTitle>
          <SheetDescription>
            Welcome to Briefly – Complete these steps to unlock the full Briefly experience.
          </SheetDescription>
        </SheetHeader>
          <Tabs defaultValue="guide" className="mt-4 space-y-6">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="guide">Feature Guide</TabsTrigger>
            </TabsList>
            <TabsContent value="guide" className="space-y-4 mt-4 p-4">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-4">
                {filteredFeatures.map((feat) => (
                  <details key={feat.id} className="group rounded-md border p-3">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium">
                      <span className="flex items-center gap-2">
                        {feat.icon}
                        {feat.title}
                      </span>
                      <span className="transform transition-transform group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="mt-2 text-sm text-muted-foreground">{feat.description}</div>
                    <div className="mt-2 text-sm">{feat.content}</div>
                  </details>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
