
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
  onValueChange?: (value: string) => void;
}

export default function LanguageSelect({ onValueChange }: LanguageSelectProps) {
  return (
    <Select defaultValue="c#">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        <SelectItem value="c#">C#</SelectItem>
      </SelectContent>
    </Select>
  );
}
