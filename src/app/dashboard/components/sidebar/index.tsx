"use client";

import {
  BellIcon,
  HomeIcon,
  LibraryIcon,
  PackageIcon,
  SettingsIcon,
  Upload,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useNotificationsStore } from "@/lib/notifications/useNotificationsStore";
import { Badge } from "@/components/ui/badge";
import { useMockNotificationsStore } from "@/lib/notifications/useMockNotificationsStore";

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  link: string;
  isActive?: boolean;
  showBadge?: boolean;
  badgeCount?: number;
}

const SidebarButton = ({
  icon,
  label,
  link,
  isActive,
  showBadge,
  badgeCount,
}: SidebarButtonProps) => {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => {
        router.push(link);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex flex-col items-center justify-center font-sans text-sm bg-transparent w-full aspect-square rounded-md cursor-pointer transition-all duration-200 ${
        isActive
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-foreground hover:text-accent-foreground hover:bg-accent/50"
      }`}
      title={label}
    >
      <motion.div
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      {showBadge && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          {badgeCount}
        </Badge>
      )}
    </motion.button>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { addinUpdateNotifications, hasUserCheckedNotifications } =
    useNotificationsStore();

  const hasUnreadNotifications =
    addinUpdateNotifications.length > 0 && !hasUserCheckedNotifications;

  const buttons = [
    {
      icon: <HomeIcon />,
      label: "Home",
      link: "/dashboard",
    },
    {
      icon: <LibraryIcon />,
      label: "Library",
      link: "/dashboard/library",
    },
    {
      icon: <PackageIcon />,
      label: "Installed",
      link: "/dashboard/installed",
    },
    {
      icon: <Upload />,
      label: "Publish",
      link: "/dashboard/publish",
    },
    {
      icon: <BellIcon />,
      label: "Notifications",
      link: "/dashboard/notifications",
      showBadge: hasUnreadNotifications,
      badgeCount: addinUpdateNotifications.length,
    },
    {
      icon: <SettingsIcon />,
      label: "Settings",
      link: "/dashboard/settings",
    },
  ];

  return (
    <div className="w-16 bg-background border-r flex flex-col items-center p-2 gap-2 shadow-sm h-full">
      {buttons.map((button) => (
        <SidebarButton
          key={button.label}
          {...button}
          isActive={pathname === button.link}
        />
      ))}
    </div>
  );
}
