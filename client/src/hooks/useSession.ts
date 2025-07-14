import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/utils/http";
import { existsToken } from "@/utils/token";

export default function useSession() {
  const { data: session, ...args } = useQuery({
    queryKey: ["userSession"],
    queryFn: getSession,
    enabled: existsToken(),
  });

  return {
    session,
    ...args,
  };
}
