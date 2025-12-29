import { toast } from "sonner";
import { api } from "../lib/trpc/client";

export function useModule(isAuthenticated: boolean) {
  const utils = api.useUtils();

  //list pinned modules - only query if authenticated
  const getPinnedModules = api.module.getPinned.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  //toggle pin on/off
  const togglePinMutation = api.module.togglePin.useMutation({
    onSuccess: () => {
      utils.module.getPinned.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      console.error("Error while toggling pin module: ", error);
    },
  });

  return {
    //queries
    getPinnedModules: getPinnedModules.data,

    //mutations
    togglePin: togglePinMutation.mutateAsync,

    //states
    isToggling: togglePinMutation.isPending,
    isLoading: getPinnedModules.isLoading,
  };
}
