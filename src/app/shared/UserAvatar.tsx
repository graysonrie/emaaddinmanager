import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { useMemo } from "react";

// Function to generate a color based on a string
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL values for better color consistency
  const hue = Math.abs(hash) % 360;
  const saturation = 70 + (Math.abs(hash) % 20); // 70-90% saturation
  const lightness = 35 + (Math.abs(hash) % 15); // 45-60% lightness for good contrast

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

interface UserAvatarProps {
  userName: string | undefined;
  size?: "sm" | "md" | "lg";
  showFullname?: boolean;
}

/** If the userName is not set, the component will not render anything */
export default function UserAvatar({ userName, size = "md", showFullname = false }: UserAvatarProps) {
  const userFirstName = useMemo(() => {
    return userName?.split(" ")[0];
  }, [userName]);

  const userNameInitials = useMemo(() => {
    return userName
      ?.split(" ")
      .filter((_, i, arr) => i === 0 || i === arr.length - 1) // Only keep first and last name
      .map((name) => name[0])
      .join("");
  }, [userName]);

  const avatarColor = useMemo(() => {
    return userName ? generateColorFromString(userName) : "#6b7280";
  }, [userName]);

  const displayName = useMemo(() => {
    if (showFullname) return userName;
    return userFirstName;
  }, [showFullname, userFirstName, userName]);

  return (
    <div className="flex items-center gap-2 pr-2 pl-2">
      {userFirstName && (
        <>
          <Avatar className={cn("size-7", size === "sm" && "size-5", size === "lg" && "size-9")}>
            <AvatarFallback
              className="text-xs font-bold font-sans text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {userNameInitials}
            </AvatarFallback>
          </Avatar>
          <p className="font-sans text-sm">{displayName}</p>
        </>
      )}
    </div>
  );
}
