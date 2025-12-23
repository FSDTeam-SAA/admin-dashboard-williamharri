"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { clientAPI, jobsAPI, staffAPI } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JobFormMode = "create" | "edit";

interface JobFormProps {
  mode?: JobFormMode;
  jobId?: string;
  initialData?: {
    clientId?: string;
    clientName?: string;
    title: string;
    location: string;
    quotationNo?: string; // ✅ added
    description: string;
    price: number | string;
    targetDate?: string;
    coordinates?: { lat?: number; lang?: number };

    assignedToIds?: string[];
    assignedTo?: {
      id: string;
      username: string;
      email: string;
      role: string;
      phone?: string | null;
      avatarUrl?: string;
      uniqueId?: string;
    }[];

    photos?: string[];
    thumbnail?: string;
    methodStatementUrl?: string;
    riskAssessmentUrl?: string;
  };
  onSuccess?: () => void;
}

interface Staff {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string;
}

interface Client {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNo: string;
}

export function JobForm({
  mode = "create",
  jobId,
  initialData,
  onSuccess,
}: JobFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    location: "",
    quotationNo: "", // ✅ added
    description: "",
    price: "",
    targetDate: "",
    lat: "",
    lang: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [previewThumbnail, setPreviewThumbnail] = useState<string>("");

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const [methodStatement, setMethodStatement] = useState<File | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<File | null>(null);

  const staffQuery = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await staffAPI.getAllStaff();
      return res.data.data.results as Staff[];
    },
  });

  const clientQuery = useQuery({
    queryKey: ["clients", "select"],
    queryFn: async () => {
      const res = await clientAPI.getAllClients(1, 200);
      return res.data.data.results as Client[];
    },
  });

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      clientId: initialData.clientId || "",
      title: initialData.title || "",
      location: initialData.location || "",
      quotationNo: initialData.quotationNo || "", // ✅ added
      description: initialData.description || "",
      price: initialData.price?.toString() || "",
      targetDate: initialData.targetDate
        ? initialData.targetDate.split("T")[0]
        : "",
      lat: initialData.coordinates?.lat?.toString() || "",
      lang: initialData.coordinates?.lang?.toString() || "",
    });

    if (initialData.photos?.length) setPreviewPhotos(initialData.photos);
    if (initialData.thumbnail) setPreviewThumbnail(initialData.thumbnail);

    if (initialData.assignedToIds?.length) {
      setSelectedStaffIds(initialData.assignedToIds);
    } else if (initialData.assignedTo?.length) {
      setSelectedStaffIds(initialData.assignedTo.map((s) => s.id));
    }
  }, [initialData]);

  const jobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (mode === "edit" && jobId) return jobsAPI.updateJob(jobId, data);
      return jobsAPI.createJob(data);
    },
    onSuccess: () => {
      toast.success(
        mode === "edit"
          ? "Job updated successfully!"
          : "Job posted successfully!"
      );
      onSuccess ? onSuccess() : router.push("/jobs");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          (mode === "edit" ? "Failed to update job" : "Failed to create job")
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) =>
        setPreviewPhotos((prev) => [...prev, event.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setThumbnail(file);

    const reader = new FileReader();
    reader.onload = (event) =>
      setPreviewThumbnail(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleMethodStatement = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files?.[0] && setMethodStatement(e.target.files[0]);

  const handleRiskAssessment = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files?.[0] && setRiskAssessment(e.target.files[0]);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Client is required");
      return;
    }

    const data = new FormData();

    data.append("clientId", formData.clientId);
    data.append("title", formData.title);
    data.append("location", formData.location);
    data.append("quotationNo", formData.quotationNo); // ✅ added
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("targetDate", formData.targetDate);

    if (formData.lat) data.append("lat", formData.lat);
    if (formData.lang) data.append("lang", formData.lang);

    if (selectedStaffIds.length)
      data.append("assignedTo", JSON.stringify(selectedStaffIds));

    photos.forEach((p) => data.append("photos", p));
    if (thumbnail) data.append("thumbnail", thumbnail);

    if (methodStatement) data.append("methodStatement", methodStatement);
    if (riskAssessment) data.append("riskAssessment", riskAssessment);

    jobMutation.mutate(data);
  };

  // Placeholder text for Select: show assigned staff username if exists
  const assignedStaffPlaceholder = (() => {
    if (mode === "edit" && initialData?.assignedTo?.length) {
      return initialData.assignedTo[0].username;
    }

    if (
      mode === "edit" &&
      selectedStaffIds.length > 0 &&
      staffQuery.data?.length
    ) {
      const found = staffQuery.data.find((s) => s.id === selectedStaffIds[0]);
      if (found) return found.username;
    }

    return "Select staff";
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Job" : "Post New Job"}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Client</label>
              {clientQuery.isLoading ? (
                <p className="text-sm text-gray-500">Loading clients...</p>
              ) : clientQuery.error ? (
                <p className="text-sm text-red-600">Failed to load clients</p>
              ) : (
                <Select
                  value={formData.clientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clientId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientQuery.data?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {client.clientName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {client.clientEmail}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Job Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* LOCATION + QUOTATION + DESCRIPTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* ✅ Quotation No */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Quotation No
              </label>
              <Input
                name="quotationNo"
                value={formData.quotationNo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
          </div>

          {/* ASSIGN STAFF */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Assign Staff (You can also assign staff later in job details)
            </label>

            {staffQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading staff...</p>
            ) : staffQuery.error ? (
              <p className="text-sm text-red-600">Failed to load staff</p>
            ) : (
              <Select
                value={selectedStaffIds[0] || ""}
                onValueChange={(value) => setSelectedStaffIds([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={assignedStaffPlaceholder} />
                </SelectTrigger>

                <SelectContent>
                  {staffQuery.data?.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center gap-3">
                        {staff.avatarUrl && staff.avatarUrl !== "" ? (
                          <Image
                            src={staff.avatarUrl}
                            alt={staff.username}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300" />
                        )}

                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {staff.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {staff.role} - {staff.email}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* PHOTOS */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Upload Photos
            </label>

            <div className="border-2 border-dashed p-6 rounded-lg text-center bg-gray-900">
              <Upload className="text-white mx-auto mb-2" />
              <label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotosChange}
                  className="hidden"
                />
                <span className="text-white underline cursor-pointer">
                  Choose Files
                </span>
              </label>
            </div>

            {previewPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {previewPhotos.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      className="w-full h-24 rounded-lg object-cover"
                      alt={`photo-${idx}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* THUMBNAIL */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Upload Thumbnail
            </label>

            <div className="border-2 border-dashed p-6 rounded-lg text-center bg-gray-900">
              <Upload className="text-white mx-auto mb-2" />
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <span className="text-white underline cursor-pointer">
                  Choose File
                </span>
              </label>
            </div>

            {previewThumbnail && (
              <div className="mt-3">
                <img
                  src={previewThumbnail}
                  className="w-40 h-32 rounded-lg object-cover"
                  alt="thumbnail"
                />
              </div>
            )}
          </div>

          {/* METHOD STATEMENT PDF */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Method Statement (PDF)
            </label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleMethodStatement}
            />

            {initialData?.methodStatementUrl && !methodStatement && (
              <p className="text-xs mt-1">
                Existing:{" "}
                <a
                  href={initialData.methodStatementUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-500"
                >
                  View current file
                </a>
              </p>
            )}
          </div>

          {/* RISK ASSESSMENT PDF */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Risk Assessment (PDF)
            </label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleRiskAssessment}
            />

            {initialData?.riskAssessmentUrl && !riskAssessment && (
              <p className="text-xs mt-1">
                Existing:{" "}
                <a
                  href={initialData.riskAssessmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-500"
                >
                  View current file
                </a>
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={jobMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg"
          >
            {jobMutation.isPending
              ? mode === "edit"
                ? "Updating..."
                : "Posting..."
              : mode === "edit"
              ? "Save Changes"
              : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
