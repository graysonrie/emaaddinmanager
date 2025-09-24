import useUserPermissions from "@/lib/persistence/useUserPermissions";
import { useSetupStore } from "./useSetupStore";

export default function useSetupSubmit() {
  const { userName, adminKey, permission } = useSetupStore();
  const { registerUser, registerAdminUser } = useUserPermissions();

  const submit = async () => {
    const permissionDiscipline = permission?.forDiscipline;
    if (!permissionDiscipline) {
      throw new Error("Permission discipline is required");
    }
    if (adminKey) {
      await registerAdminUser(
        userName,
        permissionDiscipline,
        "superAdmin",
        adminKey
      );
    } else {
      await registerUser(userName, permissionDiscipline);
    }
  };

  return { submit };
}
