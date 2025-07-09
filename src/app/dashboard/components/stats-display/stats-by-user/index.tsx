import useUserStats from "@/lib/user-stats/useUserStats";
import { Download, Loader2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/app/shared/UserAvatar";
import AddinCard from "./AddinCard";
import { deduplicateInstalledAddins } from "../helpers";
import useMockUserStats from "@/lib/user-stats/useMockUserStats";
import { useState } from "react";

export default function StatsByUser() {
  const { userStats, loading, error, refresh } = useUserStats();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUserExpansion = (userEmail: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userEmail)) {
      newExpanded.delete(userEmail);
    } else {
      newExpanded.add(userEmail);
    }
    setExpandedUsers(newExpanded);
  };

  if (loading)
    return (
      <div className="flex flex-row gap-4 w-full items-center h-full justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-row gap-4 w-full items-center h-full justify-center">
        <p className="text-sm text-muted-foreground">Error: {error}</p>
      </div>
    );
  return (
    <div className="flex flex-col gap-4 w-full items-center h-full thin-scrollbar p-2">
      {userStats?.map((userStats) => {
        const deduplicatedInstalledAddins = deduplicateInstalledAddins(
          userStats.installedAddins
        );
        const isExpanded = expandedUsers.has(userStats.userEmail);
        
        return (
          <div key={userStats.userEmail} className="flex flex-col gap-2 w-full">
            <Card className="p-1 pt-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <UserAvatar
                      userName={userStats.userName}
                      showFullname={true}
                      size="md"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">
                        {userStats.userEmail}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserExpansion(userStats.userEmail)}
                    className="flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span className="text-xs">Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span className="text-xs">Expand</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0 pb-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2 items-center">
                        <Upload className="w-4 h-4 flex-shrink-0" />
                        <div className="flex flex-row gap-2 items-center">
                          <p className="text-sm font-bold font-sans">
                            Published Addins
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ({userStats.publishedAddins.length})
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {userStats.publishedAddins.map((addin) => {
                          return (
                            <AddinCard addinInfo={addin} key={addin.addin.name} />
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2 items-center">
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <div className="flex flex-row gap-2 items-center">
                          <p className="text-sm font-bold font-sans">
                            Installed Addins
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ({deduplicatedInstalledAddins.length})
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {deduplicatedInstalledAddins.map((addin) => {
                          return (
                            <AddinCard addinInfo={addin} key={addin.addin.name} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
