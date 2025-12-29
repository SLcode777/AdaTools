"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName?: string;
  action?: string;
}

export function AuthRequiredModal({
  open,
  onOpenChange,
  moduleName,
  action = "use this feature"
}: AuthRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Sign up to {action}
          </DialogTitle>
          <DialogDescription className="text-center">
            {moduleName ? `${moduleName} requires an account. ` : ""}
            Create a free account to unlock all features and save your work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Save and sync your data across devices</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Access all premium modules</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Pin your favorite tools</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full" size="lg">
            <Link href="/signup">Create Free Account</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signin">Sign In</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
