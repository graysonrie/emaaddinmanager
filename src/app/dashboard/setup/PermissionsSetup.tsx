import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Hammer, Loader2 } from "lucide-react";
import { AddinPermissionModel } from "../../../lib/addins/addin-management/types";
import { Button } from "@/components/ui/button";
import useUserPermissions from "@/lib/persistence/useUserPermissions";
import usePublicAddinPermissions from "@/lib/addins/addin-management/usePublicAddinPermissions";

interface PermissionsSetupProps {
  onComplete: () => void;
}

export default function PermissionsSetup({
  onComplete,
}: PermissionsSetupProps) {
  const { registerAndAddAllowedAddinPaths } = useUserPermissions();
  const {
    permissions: addinPermissions,
    isLoading,
    error,
  } = usePublicAddinPermissions();

  const onPermissionClick = async (permission: AddinPermissionModel) => {
    await registerAndAddAllowedAddinPaths(permission.forDiscipline);
    onComplete();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Please wait while we load available disciplines
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Hammer className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Error Loading Disciplines</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Hammer className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>One more thing...</CardTitle>
        <CardDescription>Select your discipline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {addinPermissions.map((permission) => (
            <Button
              key={permission.relativePathToAddin}
              variant="outline"
              className="w-full rainbow-border"
              onClick={() => onPermissionClick(permission)}
            >
              <p>
                {permission.emoji} {permission.forDiscipline}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
