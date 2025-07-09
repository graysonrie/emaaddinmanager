import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";

interface AddinUpdateNotificationCardProps {
  notification: UpdateNotificationModel;
}

export default function AddinUpdateNotificationCard({
  notification,
}: AddinUpdateNotificationCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Addin Updated</span>
          <Badge variant="default">{notification.addinName}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The addin <span className="font-bold">{notification.addinName}</span>{" "}
          has been updated to the latest version.
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          Vendor: {notification.addinVendorId}
        </div>
      </CardContent>
    </Card>
  );
}
