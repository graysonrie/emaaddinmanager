import MessageDialog from "@/components/dialogs/MessageDialog";

interface Props {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
}

export default function FailedToUninstallAddinDialog({
  isOpen,
  setIsOpen,
  onClose,
}: Props) {
  return (
    <MessageDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Failed to uninstall addin"
      message="Please ensure that Revit is not running and try again."
      onClose={onClose}
    />
  );
}
