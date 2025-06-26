"use client";

import { HomeIcon } from "lucide-react";

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SidebarButton = ({ icon, label, onClick }: SidebarButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center font-sans text-sm text-foreground hover:text-accent-foreground bg-input w-full aspect-square rounded-md cursor-pointer active:bg-muted"
    >
      {icon}
    </button>
  );
};

export default function Sidebar() {
  const buttons = [
    {
      icon: <HomeIcon />,
      label: "Home",
      onClick: () => {},
    },
  ];

  return (
    <div className="w-16 bg-muted flex flex-col items-center p-2">
      {buttons.map((button) => (
        <SidebarButton key={button.label} {...button} />
      ))}
    </div>
  );
}
