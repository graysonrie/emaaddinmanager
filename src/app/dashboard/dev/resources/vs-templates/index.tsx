import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Infinity, Loader2 } from "lucide-react";
import useDevVsTemplates from "./useDevVsTemplates";
import VisualStudioTemplate from "./VisualStudioTemplate";

export default function DevVsTemplates() {
  const {
    availableTemplates,
    selectedTemplates,
    selectTemplate,
    deselectTemplate,
    installSelectedTemplates,
    error,
    isLoading,
    isInstalling,
  } = useDevVsTemplates();

  const handleSelectTemplate = (template: any) => {
    selectTemplate(template);
  };

  const handleDeselectTemplate = (template: any) => {
    deselectTemplate(template);
  };

  const handleInstall = async () => {
    await installSelectedTemplates();
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Infinity className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Visual Studio Templates</h2>
          </div>
          <p className="text-muted-foreground mt-2">
            Select and install development templates for your projects
          </p>
        </div>

        {selectedTemplates.length > 0 && (
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            size="lg"
            className="flex items-center gap-2"
          >
            {isInstalling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Install {selectedTemplates.length} Template
            {selectedTemplates.length !== 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Separator />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading templates...</p>
          </div>
        </div>
      ) : availableTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p>No templates available</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
          {availableTemplates.map((templateState) => (
            <VisualStudioTemplate
              key={templateState.template.displayName}
              template={templateState.template}
              isSelected={templateState.isSelected}
              onSelect={handleSelectTemplate}
              onDeselect={handleDeselectTemplate}
            />
          ))}
        </div>
      )}

      {selectedTemplates.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <span className="font-medium">{selectedTemplates.length}</span>{" "}
                template{selectedTemplates.length !== 1 ? "s" : ""} selected
              </div>
              <Button onClick={handleInstall} disabled={isInstalling} size="sm">
                {isInstalling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Install
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
