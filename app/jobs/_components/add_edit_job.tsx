"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "@/lib/api";
import { JobForm } from "@/components/job-form";
import { Skeleton } from "@/components/ui/skeleton";

interface AddEditjobProps {
  mode: "create" | "edit";
  jobId?: string;
  onSuccess?: () => void;
}

function AddEditjob({ mode, jobId, onSuccess }: AddEditjobProps) {
  const isEdit = mode === "edit";

  const { data, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsAPI.getJobById(jobId!),
    enabled: isEdit && !!jobId,
  });

  const job = data?.data?.data;

  const initialData =
    isEdit && job
      ? {
          clientId: job.client?.id || job.clientId,
          clientName: job.client?.clientName || job.companyName,
          title: job.title,
          location: job.location,
          description: job.description,
          quotationNo: job.quotationNo,
          price: job.price,
          photos: job.photos || [],
          thumbnail: job.thumbnail || "",
          targetDate: job.targetDate, // if your API returns this
          coordinates: job.coordinates,

          // ðŸ”½ pass assigned staff objects from backend
          assignedTo: job.assignedTo || [],

          // ðŸ”½ also pass just the IDs (helps JobForm pre-select)
          assignedToIds: (job.assignedTo || []).map(
            (staff: { id: string }) => staff.id
          ),

          // ðŸ”½ if your API has these
          methodStatementUrl: job.methodStatementUrl,
          riskAssessmentUrl: job.riskAssessmentUrl,
        }
      : undefined;

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Edit Job" : "Post Job"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? "Update job posting" : "Create a new job posting"}
        </p>
      </div> */}

      {isEdit && isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <JobForm
          mode={mode}
          jobId={jobId}
          initialData={initialData}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

export default AddEditjob;


