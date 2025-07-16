import { Button } from "@/components/ui/button";
import { useAddinUpdater } from "@/lib/addins/addin-updater/useAddinUpdater";

interface CheckForUpdatesButtonProps {
  onClick?: () => void;
}

export default function CheckForUpdatesButton({
  onClick,
}: CheckForUpdatesButtonProps) {
  const { checkForUpdates } = useAddinUpdater();

  const handleClick = () => {
    checkForUpdates();
    onClick?.();
  };

  return <Button onClick={handleClick}>Check for Updates</Button>;
}
