"use client";

import { HomeIcon, LibraryIcon, PackageIcon, SettingsIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  link: string;
  isActive?: boolean;
}

const SidebarButton = ({ icon, label, link, isActive }: SidebarButtonProps) => {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => {
        router.push(link);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center justify-center font-sans text-sm bg-transparent w-full aspect-square rounded-md cursor-pointer transition-all duration-200 ${
        isActive
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-foreground hover:text-accent-foreground hover:bg-accent/50"
      }`}
    >
      <motion.div
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

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
