import { toast } from "sonner";
import { api } from "../lib/trpc/client";
import type { ColumnCount } from "../types/module-order";

export function useModule(isAuthenticated: boolean, columnCount: ColumnCount) {
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

  //get module order - only query if authenticated
  const getModuleOrder = api.module.getModuleOrder.useQuery(
    { columnCount },
    {
      enabled: isAuthenticated,
    }
  );

  //update module order
  const updateModuleOrderMutation = api.module.updateModuleOrder.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.module.getModuleOrder.cancel({ columnCount: variables.columnCount });

      // Snapshot previous value
      const previousOrder = utils.module.getModuleOrder.getData({ columnCount: variables.columnCount });

      // Optimistically update
      utils.module.getModuleOrder.setData(
        { columnCount: variables.columnCount },
        variables.moduleOrder
      );

      return { previousOrder, columnCount: variables.columnCount };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrder && context?.columnCount) {
        utils.module.getModuleOrder.setData(
          { columnCount: context.columnCount },
          context.previousOrder
        );
      }
      toast.error("Failed to save module order");
      console.error("Error updating module order: ", err);
    },
    onSettled: (data, error, variables) => {
      utils.module.getModuleOrder.invalidate({ columnCount: variables.columnCount });
    },
  });

  return {
    //queries
    getPinnedModules: getPinnedModules.data,
    getModuleOrder: getModuleOrder.data,

    //mutations
    togglePin: togglePinMutation.mutateAsync,
    updateModuleOrder: updateModuleOrderMutation.mutateAsync,

    //states
    isToggling: togglePinMutation.isPending,
    isLoading: getPinnedModules.isLoading,
    isOrderLoading: getModuleOrder.isLoading,
    isOrderUpdating: updateModuleOrderMutation.isPending,
  };
}
