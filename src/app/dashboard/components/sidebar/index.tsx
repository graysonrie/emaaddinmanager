"use client";

import { useState, useEffect } from "react";
import {
  BellIcon,
  ChartBarBig,
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
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { Separator } from "@/components/ui/separator";
import { useLocalAddinExporterStore } from "@/app/dashboard/publish/stores/useLocalAddinExporterStore";
import { useAddinUpdaterStore } from "@/lib/addins/addin-updater/useAddinUpdaterStore";

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
  onNavigate,
}: SidebarButtonProps & { onNavigate?: () => void }) => {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => {
        onNavigate?.();
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
  const { updateNotifications, hasUserCheckedNotifications } =
    useAddinUpdaterStore();
  const authStore = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const { reset } = useLocalAddinExporterStore();

  const hasUnreadNotifications =
    updateNotifications.length > 0 && !hasUserCheckedNotifications;

  // Check admin status on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminResult = await authStore.amIAnAdmin();
      if (adminResult == "admin" || adminResult == "super") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [authStore]);

  const buttons = [
    {
      icon: <HomeIcon />,
      label: "Home",
      link: "/dashboard",
    },

    {
      icon: <PackageIcon />,
      label: "Installed",
      link: "/dashboard/installed",
    },
    {
      icon: <BellIcon />,
      label: "Notifications",
      link: "/dashboard/notifications",
      showBadge:
        updateNotifications.filter((x) => !x.title.includes("No updates"))
          .length > 0,
      badgeCount: updateNotifications.filter(
        (x) => !x.title.includes("No updates")
      ).length,
    },
    {
      icon: <SettingsIcon />,
      label: "Settings",
      link: "/dashboard/settings",
    },
  ];

  const adminButtons = [
    {
      icon: <LibraryIcon />,
      label: "Library",
      link: "/dashboard/library",
    },
    {
      icon: <ChartBarBig />,
      label: "User Stats",
      link: "/dashboard/user-stats",
    },
    {
      icon: <Upload />,
      label: "Publish",
      link: "/dashboard/publish",
      onNavigate: reset,
    },
  ];

  return (
    <div className="w-16  flex flex-col items-center p-2 gap-2 shadow-sm h-full">
      {buttons.map((button) => (
        <SidebarButton
          key={button.label}
          {...button}
          isActive={pathname === button.link}
        />
      ))}
      {isAdmin && (
        <>
          <Separator className="w-full my-2" />
          {adminButtons.map((button) => (
            <SidebarButton
              key={button.label}
              icon={button.icon}
              label={button.label}
              link={button.link}
              isActive={pathname === button.link}
              onNavigate={button.onNavigate}
            />
          ))}
        </>
      )}
    </div>
  );
}
