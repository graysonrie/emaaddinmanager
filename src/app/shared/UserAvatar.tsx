import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { useMemo, useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { Badge } from "@/components/ui/badge";

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
  userEmail: string;
  size?: "sm" | "md" | "lg";
  showFullname?: boolean;
  onClick?: () => void;
}

/** If the userName is not set, the component will not render anything */
export default function UserAvatar({
  userName,
  userEmail,
  size = "md",
  showFullname = false,
  onClick,
}: UserAvatarProps) {
  const userFirstName = useMemo(() => {
    return userName?.split(" ")[0];
  }, [userName]);

  const [adminStatus, setAdminStatus] = useState<string | undefined>();
  useEffect(() => {
    const checkAdmin = async () => {
      const status = await useAuthStore.getState().isAdmin(userEmail);
      setAdminStatus(status);
    };
    checkAdmin();
  }, []);

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
    <div
      className={cn(
        "flex items-center gap-2 pr-2 pl-2 rounded-md p-1",
        onClick && "cursor-pointer hover:bg-muted transition-colors"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {userFirstName && (
        <>
          <Avatar
            className={cn(
              "size-7",
              size === "sm" && "size-5",
              size === "lg" && "size-9"
            )}
          >
            <AvatarFallback
              className="text-xs font-bold font-sans text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {userNameInitials}
            </AvatarFallback>
          </Avatar>
          <p
            className={cn(
              "font-sans text-sm text-foreground",
              onClick && "hover:text-blue-500"
            )}
          >
            {displayName}
          </p>
        </>
      )}
      {(adminStatus === "admin" || adminStatus === "super") && (
        <>
          <p
            className={cn(
              "text-xs text-muted-foreground",
              adminStatus == "super" && "font-bold"
            )}
          >
            (Admin)
          </p>
          <span className="pb-0.5">{adminStatus == "super" && "👑"}</span>
        </>
      )}
    </div>
  );
}
