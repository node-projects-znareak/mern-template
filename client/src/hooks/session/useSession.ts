import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/utils/http";

export default function useSession() {
  const { data: session = null, ...args } = useQuery({
    queryKey: ["userSession"],
    queryFn: getSession,
    retry: 1,
  });

  return {
    session,
    ...args,
  };
}
