import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Hammer } from "lucide-react";
import {
  AddinPermissionModel,
  DEFAULT_ADDIN_PERMISSIONS,
} from "../../../lib/addins/addin-management/types";
import { Button } from "@/components/ui/button";
import useUserPermissions from "@/lib/persistence/useUserPermissions";

export default function PermissionsSetup() {
  const { registerAndAddAllowedAddinPaths } = useUserPermissions();
  const addinPermissions = DEFAULT_ADDIN_PERMISSIONS;

  const onPermissionClick = async (permission: AddinPermissionModel) => {
    await registerAndAddAllowedAddinPaths(permission.forDiscipline);
  };
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
