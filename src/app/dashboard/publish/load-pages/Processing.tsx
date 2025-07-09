import { Loader } from "lucide-react";

interface Props {
  message: string;
}

export default function Processing({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-2xl font-bold">{message}</h1>
      <Loader className="animate-spin" />
    </div>
  );
}