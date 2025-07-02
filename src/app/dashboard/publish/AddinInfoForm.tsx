import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { usePublishStore } from "./store";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";

interface Props {
  addinFileInfo: SimplifiedAddinInfoModel;
  onAddinFileInfoChange: (info: SimplifiedAddinInfoModel) => void;
}

export default function AddinInfoForm() {
  const { addinFileInfo, setAddinFileInfo } = usePublishStore();
  const handleChange = (
    field: keyof SimplifiedAddinInfoModel,
    value: string
  ) => {
    setAddinFileInfo({
      ...addinFileInfo,
      [field]: value,
    });
  };

  const { data: userEmail } = useConfigValue("userEmail");

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Addin Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Addin Name</Label>
          <Input
            id="name"
            placeholder="Enter the name of your addin"
            value={addinFileInfo.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor_id">Vendor ID</Label>
          <Input
            id="vendor_id"
            placeholder="Enter your vendor ID"
            value={addinFileInfo.vendor_id}
            onChange={(e) => handleChange("vendor_id", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <label id="email" className="text-sm text-muted-foreground">
            {userEmail}
          </label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter a description of your addin"
            value={addinFileInfo.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("description", e.target.value)
            }
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
