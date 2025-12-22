"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Plus, Trash2 } from "lucide-react";

interface Client {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNo: string;
  createdAt?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const emptyForm = {
  clientName: "",
  clientEmail: "",
  clientPhoneNo: "",
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", page, search],
    queryFn: async () => {
      const response = await clientAPI.getAllClients(page, limit, search.trim());
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) => clientAPI.createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client created successfully");
      setDialogOpen(false);
      setEditingClient(null);
      setFormData(emptyForm);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create client");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof emptyForm }) =>
      clientAPI.updateClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client updated successfully");
      setDialogOpen(false);
      setEditingClient(null);
      setFormData(emptyForm);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update client");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientAPI.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete client");
    },
  });

  useEffect(() => {
    if (!editingClient) return;
    setFormData({
      clientName: editingClient.clientName || "",
      clientEmail: editingClient.clientEmail || "",
      clientPhoneNo: editingClient.clientPhoneNo || "",
    });
  }, [editingClient]);

  const clients: Client[] = data?.results || [];
  const pagination: PaginationData = data?.pagination || {
    page: 1,
    limit,
    totalDocs: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingClient(null);
      setFormData(emptyForm);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage client records</p>
        </div>

        <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search clients"
          className="max-w-sm"
        />
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading clients
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-10 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="text-sm text-gray-600">{client.clientEmail}</TableCell>
                        <TableCell className="text-sm text-gray-600">{client.clientPhoneNo}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(client)}>
                              <Edit className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this client? This action can be reversed by re-creating the
                                  same email later.
                                </AlertDialogDescription>
                                <div className="flex justify-end gap-3">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(client.id)}
                                    disabled={deleteMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.totalDocs)} of {pagination.totalDocs}
              results
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev}>
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setPage(page + 1)} disabled={!pagination.hasNext}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Client Name</label>
              <Input
                name="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Client Email</label>
              <Input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Client Phone</label>
              <Input
                name="clientPhoneNo"
                value={formData.clientPhoneNo}
                onChange={(e) => setFormData({ ...formData, clientPhoneNo: e.target.value })}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingClient
                  ? updateMutation.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createMutation.isPending
                  ? "Creating..."
                  : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

