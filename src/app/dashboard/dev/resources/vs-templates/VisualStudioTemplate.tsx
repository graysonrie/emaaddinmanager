import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { VsTemplateModel } from "@/lib/models/vs-template.model";

// Helper function to convert number array to base64 string
const arrayToBase64 = (bytes: number[]): string => {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
};

interface VisualStudioTemplateProps {
  template: VsTemplateModel;
  isSelected: boolean;
  onSelect: (template: VsTemplateModel) => void;
  onDeselect: (template: VsTemplateModel) => void;
}

export default function VisualStudioTemplate({
  template,
  isSelected,
  onSelect,
  onDeselect,
}: VisualStudioTemplateProps) {
  const handleToggle = () => {
    if (isSelected) {
      onDeselect(template);
    } else {
      onSelect(template);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={handleToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {template.displayName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {template.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
            />
            {template.isInstalled && (
              <Badge variant="secondary" className="text-xs">
                Installed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {template.imageData && template.imageData.length > 0 && (
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${arrayToBase64(template.imageData)}`}
              alt={template.displayName}
              className="max-w-full h-32 object-contain rounded-md border"
              onError={(e) => {
                // Hide image if it fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        )}
        {template.version && (
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-xs">
              Version {template.version}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
