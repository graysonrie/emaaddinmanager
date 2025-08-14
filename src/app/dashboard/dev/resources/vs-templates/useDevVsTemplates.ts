import getTauriCommands from "@/lib/commands/getTauriCommands";
import { VsTemplateModel } from "@/lib/models/vs-template.model";
import { useEffect, useState } from "react";

export interface VsTemplateStateModel {
  isSelected: boolean;
  template: VsTemplateModel;
}

export default function useDevVsTemplates() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<
    VsTemplateStateModel[]
  >([]);
  const [selectedTemplates, setSelectedTemplates] = useState<
    VsTemplateStateModel[]
  >([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const templates =
          await getTauriCommands().getDevVisualStudioTemplates();
        setAvailableTemplates(
          templates.map((t) => ({ isSelected: false, template: t }))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load templates"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const selectTemplate = (template: VsTemplateModel) => {
    setAvailableTemplates((prev) =>
      prev.map((t) =>
        t.template.displayName === template.displayName
          ? { ...t, isSelected: true }
          : t
      )
    );
    setSelectedTemplates((prev) => [...prev, { isSelected: true, template }]);
  };

  const deselectTemplate = (template: VsTemplateModel) => {
    setAvailableTemplates((prev) =>
      prev.map((t) =>
        t.template.displayName === template.displayName
          ? { ...t, isSelected: false }
          : t
      )
    );
    setSelectedTemplates((prev) =>
      prev.filter((t) => t.template.displayName !== template.displayName)
    );
  };

  const installSelectedTemplates = async () => {
    if (selectedTemplates.length === 0) return;

    try {
      setIsInstalling(true);
      setError(null);
      const templates = selectedTemplates.map((t) => t.template);
      await getTauriCommands().installDevVisualStudioTemplates(templates);

      // Clear selection after successful installation
      setSelectedTemplates([]);

      // Refresh templates to get updated installation status
      const refreshedTemplates =
        await getTauriCommands().getDevVisualStudioTemplates();
      setAvailableTemplates(
        refreshedTemplates.map((t) => ({ isSelected: false, template: t }))
      );
    } catch (err) {
      console.warn("Failed to install templates", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to install templates. Please ensure you have correctly installed Microsoft Visual Studio 2022."
      );
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    availableTemplates,
    selectedTemplates,
    selectTemplate,
    deselectTemplate,
    installSelectedTemplates,
    error,
    isLoading,
    isInstalling,
  };
}
