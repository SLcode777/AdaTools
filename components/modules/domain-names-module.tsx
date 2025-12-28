"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/src/lib/trpc/client";
import {
  ArrowUpDown,
  Edit,
  ExternalLink,
  Globe,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Module } from "../dashboard/module";

interface DomainNamesModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

type SortField = "domain" | "expiresAt" | "registrar";
type SortOrder = "asc" | "desc";

export function DomainNamesModule({
  isPinned,
  onTogglePin,
}: DomainNamesModuleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("expiresAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [formData, setFormData] = useState({
    domain: "",
    registrar: "",
    registrarUrl: "",
    expiresAt: "",
    autoRenew: false,
    reminderOneMonth: true,
    reminderOneWeek: true,
  });

  const utils = api.useUtils();

  const { data: domains, isLoading } = api.domainNames.getAll.useQuery();

  const createMutation = api.domainNames.create.useMutation({
    onSuccess: () => {
      toast.success("Domain added successfully");
      utils.domainNames.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add domain");
    },
  });

  const updateMutation = api.domainNames.update.useMutation({
    onSuccess: () => {
      toast.success("Domain updated successfully");
      utils.domainNames.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update domain");
    },
  });

  const deleteMutation = api.domainNames.delete.useMutation({
    onSuccess: () => {
      toast.success("Domain deleted successfully");
      utils.domainNames.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete domain");
    },
  });

  const resetForm = () => {
    setFormData({
      domain: "",
      registrar: "",
      registrarUrl: "",
      expiresAt: "",
      autoRenew: false,
      reminderOneMonth: true,
      reminderOneWeek: true,
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.domain || !formData.registrar || !formData.expiresAt) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data = {
      domain: formData.domain,
      registrar: formData.registrar,
      registrarUrl: formData.registrarUrl,
      expiresAt: new Date(formData.expiresAt),
      autoRenew: formData.autoRenew,
      reminderOneMonth: formData.reminderOneMonth,
      reminderOneWeek: formData.reminderOneWeek,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (domain: {
    id: string;
    domain: string;
    registrar: string;
    registrarUrl?: string | null;
    expiresAt: Date;
    autoRenew: boolean;
    reminderOneMonth: boolean;
    reminderOneWeek: boolean;
  }) => {
    setEditingId(domain.id);
    setFormData({
      domain: domain.domain,
      registrar: domain.registrar,
      registrarUrl: domain.registrarUrl || "",
      expiresAt: new Date(domain.expiresAt).toISOString().split("T")[0],
      autoRenew: domain.autoRenew,
      reminderOneMonth: domain.reminderOneMonth,
      reminderOneWeek: domain.reminderOneWeek,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, domainName: string) => {
    if (confirm(`Delete "${domainName}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedDomains = domains
    ? [...domains].sort((a, b) => {
        let comparison = 0;
        if (sortField === "domain") {
          comparison = a.domain.localeCompare(b.domain);
        } else if (sortField === "registrar") {
          comparison = a.registrar.localeCompare(b.registrar);
        } else if (sortField === "expiresAt") {
          comparison =
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        }
        return sortOrder === "asc" ? comparison : -comparison;
      })
    : [];

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    return Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <Module
      title="Domain Names Reminder"
      description="List your domain names and get reminders"
      icon={<Globe className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="w-full"
                variant={"secondary"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Domain" : "Add Domain"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update domain information and reminder settings"
                    : "Add a new domain to track its expiration"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="domain">Domain Name *</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="registrar">Registrar *</Label>
                  <Input
                    id="registrar"
                    value={formData.registrar}
                    onChange={(e) =>
                      setFormData({ ...formData, registrar: e.target.value })
                    }
                    placeholder="Porkbun, Namecheap, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="registrarUrl">Registrar URL</Label>
                  <Input
                    id="registrarUrl"
                    type="url"
                    value={formData.registrarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, registrarUrl: e.target.value })
                    }
                    placeholder="https://porkbun.com"
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expiration Date *</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRenew"
                    checked={formData.autoRenew}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        autoRenew: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="autoRenew" className="cursor-pointer">
                    Auto Renew Enabled
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label>Email Reminders</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reminderOneMonth"
                      checked={formData.reminderOneMonth}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          reminderOneMonth: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="reminderOneMonth"
                      className="cursor-pointer"
                    >
                      1 month before expiration
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reminderOneWeek"
                      checked={formData.reminderOneWeek}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          reminderOneWeek: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="reminderOneWeek" className="cursor-pointer">
                      1 week before expiration
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading domains...
          </div>
        ) : !domains || domains.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              No domains added yet. Click &quot;Add Domain&quot; to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-md ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left  pl-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("registrar")}
                      className="font-semibold"
                    >
                      Registrar
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-left pl-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("domain")}
                      className="font-semibold"
                    >
                      Domain
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-left pl-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("expiresAt")}
                      className="font-semibold"
                    >
                      Expires
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-left text-xs">
                    Auto Renew
                  </TableHead>
                  <TableHead className="text-left text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDomains.map((domain) => {
                  const daysUntilExpiry = getDaysUntilExpiry(domain.expiresAt);
                  const isExpiringSoon = daysUntilExpiry <= 30;
                  const isExpired = daysUntilExpiry < 0;

                  return (
                    <TableRow key={domain.id}>
                      <TableCell>
                        {domain.registrarUrl ? (
                          <a
                            href={domain.registrarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {domain.registrar}
                          </a>
                        ) : (
                          domain.registrar
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {domain.domain}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            className={
                              isExpired
                                ? "text-destructive text-xs font-semibold"
                                : isExpiringSoon
                                ? "text-orange-500 text-xs font-semibold"
                                : "text-xs"
                            }
                          >
                            {new Date(domain.expiresAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          {isExpired ? (
                            <span className="text-xs text-destructive">
                              Expired
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="text-xs text-orange-500">
                              {daysUntilExpiry} day
                              {daysUntilExpiry !== 1 ? "s" : ""} left
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {domain.autoRenew ? (
                          <RefreshCw className="h-4 w-4 mx-auto text-primary" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(domain)}
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(domain.id, domain.domain)
                            }
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Module>
  );
}
