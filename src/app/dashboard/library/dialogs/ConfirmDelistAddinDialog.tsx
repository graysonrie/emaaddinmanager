import MessageDialog from "@/components/dialogs/MessageDialog";

interface ConfirmDelistAddinDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOk: () => void;
}

export default function ConfirmDelistAddinDialog({
  isOpen,
  setIsOpen,
  onOk,
}: ConfirmDelistAddinDialogProps) {
  return (
    <MessageDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Delist Addin"
      message="Are you sure you want to delist this addin? This will prevent all users from installing it, but will not remove it from their machines if they have it installed locally."
      okButtonText="Delist"
      okButtonVariant="destructive"
      cancelButtonText="Cancel"
      onOk={onOk}
    />
  );
}
