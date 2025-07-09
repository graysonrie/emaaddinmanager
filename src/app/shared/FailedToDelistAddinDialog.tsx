import MessageDialog from "@/components/dialogs/MessageDialog";

interface Props {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
}

export default function FailedToDelistAddinDialog({
  isOpen,
  setIsOpen,
  onClose,
}: Props) {
  return (
    <MessageDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Failed to delist addin"
      message="Please try again later."
      onClose={onClose}
    />
  );
}
