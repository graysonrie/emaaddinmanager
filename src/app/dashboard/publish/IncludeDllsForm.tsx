import { DllModel } from "@/lib/models/dll.model";

interface Props {
  dlls: DllModel[];
  onDllsChange: (dlls: DllModel[]) => void;
}
export default function IncludeDllsForm({ dlls, onDllsChange }: Props) {
  return <div>IncludeDllsForm</div>;
}
