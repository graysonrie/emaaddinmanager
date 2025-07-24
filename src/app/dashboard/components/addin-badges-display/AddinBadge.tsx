import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderOpen } from "lucide-react";
import { AddinPermissionModel } from "@/lib/addins/addin-management/types";

interface AddinBadgeProps {
  addinPermission: AddinPermissionModel;
}

export default function AddinBadge({ addinPermission }: AddinBadgeProps) {
  // Extract the addin name from the path (last part after the last slash)
  const addinName = addinPermission.displayName;

  const folderPath = addinPermission.relativePathToAddin
    .split("/")
    .slice(0, -1)
    .join("/");
  const addinImage = addinPermission.image;

  return (
    <Card 
      className={`h-64 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/20 w-96 relative overflow-hidden ${
        addinImage ? 'bg-cover bg-center bg-no-repeat' : ''
      }`}
      style={addinImage ? {
        backgroundImage: `url(${addinImage})`,
      } : undefined}
    >
      {/* Dark overlay for better text readability when image exists */}
      {addinImage && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      )}
      
      {/* Content with proper z-index to appear above overlay */}
      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              addinImage ? 'bg-white/20 backdrop-blur-sm' : 'bg-primary/10'
            }`}>
              <Package className={`w-8 h-8 ${
                addinImage ? 'text-white' : 'text-primary'
              }`} />
            </div>
            <CardTitle className={`text-lg font-semibold truncate ${
              addinImage ? 'text-white drop-shadow-lg' : 'text-foreground'
            }`}>
              {addinName}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-between flex-1">
          <div className={`flex items-center gap-2 text-md ${
            addinImage ? 'text-white/90 drop-shadow-md' : 'text-muted-foreground'
          }`}>
            <FolderOpen className="w-4 h-4" />
            <span className="truncate">{folderPath || "Root"}</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
