"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JobDetailsProps {
  jobId: string;
}

function JobDetails({ jobId }: JobDetailsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsAPI.getJobById(jobId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.data?.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load job details
      </div>
    );
  }

  const job = data.data.data;

  // Prefer latestScaffold if available, otherwise fall back to scaffoldApplication
  const scaffoldApp =
    job.latestScaffold || job.scaffoldApplication || null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Client */}
        <div>
          <p className="text-sm text-gray-500">Client</p>
          <p className="font-medium">{job.client?.clientName || job.companyName}</p>
          {job.client?.clientEmail && (
            <p className="text-sm text-gray-500">{job.client.clientEmail}</p>
          )}
          {job.client?.clientPhoneNo && (
            <p className="text-sm text-gray-500">{job.client.clientPhoneNo}</p>
          )}
        </div>

        {/* Location + Price + Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{job.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">Aś{job.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{job.jobStatus || job.status}</p>
          </div>
        </div>

        {job.coordinates && (
          <div>
            <p className="text-sm text-gray-500">Coordinates</p>
            <p className="font-medium">
              {job.coordinates.lat}, {job.coordinates.lang}
            </p>
          </div>
        )}

        {/* Scaffold Status */}
        <div>
          <p className="text-sm text-gray-500">Scaffold Status</p>
          <p className="font-medium capitalize">
            {job.scaffoldStatus || "N/A"}
          </p>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="mt-1 text-gray-800 whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Posted By */}
        {job.postedBy && (
          <div>
            <p className="text-sm text-gray-500">Posted By</p>
            <p className="mt-1 text-gray-800">
              {job.postedBy.name} ({job.postedBy.email})
            </p>
          </div>
        )}

        {/* Assigned To */}
        {Array.isArray(job.assignedTo) && job.assignedTo.length > 0 && (
          <div>
            <p className="text-sm text-gray-500">Assigned To</p>
            <ul className="mt-1 text-gray-800 space-y-1">
              {job.assignedTo.map((staff: any) => (
                <li key={staff.id}>
                  {staff.username} ({staff.email})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Scaffold Application / Latest Scaffold */}
        {scaffoldApp && (
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <p className="text-sm text-gray-500">
              Scaffold Application
              {job.latestScaffold ? " (Latest)" : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-medium">Status: </span>
                <span className="capitalize">
                  {scaffoldApp.status || "N/A"}
                </span>
              </div>

              <div>
                <span className="font-medium">Revision: </span>
                {scaffoldApp.revision ?? 0}
              </div>

              <div>
                <span className="font-medium">Applicant: </span>
                {scaffoldApp.applicant
                  ? `${scaffoldApp.applicant.username} (${scaffoldApp.applicant.email})`
                  : "N/A"}
              </div>

              <div>
                <span className="font-medium">Submitted At: </span>
                {scaffoldApp.createdAt
                  ? new Date(scaffoldApp.createdAt).toLocaleString()
                  : "N/A"}
              </div>

              <div>
                <span className="font-medium">Photos: </span>
                {Array.isArray(scaffoldApp.photos)
                  ? scaffoldApp.photos.length
                  : 0}
              </div>

              <div>
                <span className="font-medium">RAMS Docs: </span>
                {Array.isArray(scaffoldApp.ramsDocs)
                  ? scaffoldApp.ramsDocs.length
                  : 0}
              </div>

              {scaffoldApp.signatureUrl && (
                <div className="md:col-span-2">
                  <span className="font-medium">Signature File: </span>
                  <a
                    href={scaffoldApp.signatureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    View signature
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created At: </span>
            {job.createdAt
              ? new Date(job.createdAt).toLocaleString()
              : "-"}
          </div>
          <div>
            <span className="font-medium">Target Date: </span>
            {job.targetDate
              ? new Date(job.targetDate).toLocaleDateString()
              : "-"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobDetails;




