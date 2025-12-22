"use client";

import { useState } from "react";
import { JobTable } from "@/components/job-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddEditjob from "./_components/add_edit_job";
import JobDetails from "./_components/job_details";

export type Job = {
  id: string;
  title: string;
  companyName: string;
  client?: { id: string; clientName: string; clientEmail: string; clientPhoneNo: string };
  location: string;
  price: number;
  status: string;
  scaffoldStatus: string;
  createdAt: string;
  targetDate: string;
  coordinates?: { lat?: number; lang?: number };
};

type View = "list" | "create" | "edit" | "details";

export default function JobsPage() {
  const [view, setView] = useState<View>("list");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const goToList = () => {
    setView("list");
    setEditingJobId(null);
    setSelectedJobId(null);
  };

  const handleCreateClick = () => {
    setEditingJobId(null);
    setSelectedJobId(null);
    setView("create");
  };

  const handleEditJob = (jobId: string) => {
    setEditingJobId(jobId);
    setSelectedJobId(null);
    setView("edit");
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setEditingJobId(null);
    setView("details");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {view === "list" && "All Jobs"}
            {view === "create" && "Post Job"}
            {view === "edit" && "Edit Job"}
            {view === "details" && "Job Details"}
          </h1>
          <p className="text-gray-600 mt-1">
            {view === "list" && "Manage and view all posted jobs"}
            {view === "create" && "Create a new job posting"}
            {view === "edit" && "Update job information"}
            {view === "details" && "View full job information"}
          </p>
        </div>

        {view === "list" ? (
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={handleCreateClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        ) : (
          <Button variant="outline" onClick={goToList}>
            Back to Jobs
          </Button>
        )}
      </div>

      {/* Main content */}
      {view === "list" && (
        <JobTable
          onEdit={(job) => handleEditJob(job.id)}
          onViewDetails={(job) => handleViewDetails(job.id)}
        />
      )}

      {view === "create" && (
        <AddEditjob mode="create" onSuccess={goToList} />
      )}

      {view === "edit" && editingJobId && (
        <AddEditjob mode="edit" jobId={editingJobId} onSuccess={goToList} />
      )}

      {view === "details" && selectedJobId && (
        <JobDetails jobId={selectedJobId} />
      )}
    </div>
  );
}


