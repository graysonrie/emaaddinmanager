import { useEffect, useState } from "react";
import { UserResponseModel } from "../responses/user-response.model";
import getServerCommands from "../../getServerCommands";
import { useRouter } from "next/navigation";
import useInterval from "@/lib/hooks/useInterval";

export default function useUserInfoChecker() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { getSelf } = getServerCommands();

  useInterval(() => {
    getSelf()
      .then((userData) => {
        if (userData == undefined) {
        }
        // console.log("user is logged in", userData);
        setIsLoading(false);
      })
      .catch((err) => {
        router.replace("/login");
      });
  }, 3000);

  return {
    isLoading,
  };
}
