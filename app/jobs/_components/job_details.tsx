"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Skeleton className="h-40 w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.data?.data) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
        Failed to load job details. Please try again later.
      </div>
    );
  }

  const job = data.data.data;
  const scaffoldApp = job.latestScaffold || job.scaffoldApplication || null;

  return (
    <Card className="overflow-hidden border-none shadow-md">
      {/* Hero Thumbnail */}
      {job.thumbnail && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={job.thumbnail}
            alt="Job Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
            <p className="text-muted-foreground">{job.location}</p>
          </div>
          <Badge
            variant={job.jobStatus === "completed" ? "default" : "secondary"}
            className="capitalize"
          >
            {job.jobStatus || job.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Quotation No.
            </p>
            <p className="font-medium">{job.quotationNo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Scaffold Status
            </p>
            <Badge variant="outline" className="mt-1 capitalize">
              {job.scaffoldStatus || "N/A"}
            </Badge>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Client / Company
            </p>
            <p className="font-medium">
              {job.client?.clientName || job.companyName}
            </p>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Job Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Job Media Gallery */}
        {job.photos && job.photos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Job Photos</h4>
            <div className="grid grid-cols-3 gap-2">
              {job.photos.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  className="rounded-lg object-cover h-24 w-full border"
                  alt={`Job photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Safety Documents (RAMS) */}
        {(job.methodStatementUrl || job.riskAssessmentUrl) && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3">
                Safety Documents (RAMS)
              </h4>
              <div className="flex flex-wrap gap-3">
                {job.methodStatementUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-auto py-2"
                  >
                    <a
                      href={job.methodStatementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="text-left">
                        <p className="text-xs font-medium">Method Statement</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          View PDF
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </Button>
                )}

                {job.riskAssessmentUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-auto py-2"
                  >
                    <a
                      href={job.riskAssessmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-red-500" />
                      <div className="text-left">
                        <p className="text-xs font-medium">Risk Assessment</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          View PDF
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Stakeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Posted By */}
          {job.postedBy && (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={job.postedBy.avatarUrl} />
                <AvatarFallback>{job.postedBy.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Posted By</p>
                <p className="text-sm font-medium">{job.postedBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {job.postedBy.email}
                </p>
              </div>
            </div>
          )}

          {/* Assigned To */}
          {Array.isArray(job.assignedTo) && job.assignedTo.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Assigned Staff
              </p>
              <div className="flex flex-wrap gap-2">
                {job.assignedTo.map((staff: any) => (
                  <div
                    key={staff.id}
                    className="flex items-center gap-2 bg-secondary/50 p-1 pr-3 rounded-full border"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={staff.avatarUrl} />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {staff.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scaffold Application Detailed Section */}
        {scaffoldApp && (
          <div className="mt-8 bg-muted/30 rounded-xl p-4 border border-dashed">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2">
                Scaffold Application
                {job.latestScaffold && (
                  <Badge variant="secondary" className="text-[10px]">
                    LATEST
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                Rev: {scaffoldApp.revision ?? 0}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Applicant</p>
                <p className="font-medium">
                  {scaffoldApp.applicant?.name ||
                    scaffoldApp.applicant?.username}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Submitted Date</p>
                <p className="font-medium">
                  {scaffoldApp.createdAt
                    ? new Date(scaffoldApp.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Application Photos */}
            {scaffoldApp.photos && scaffoldApp.photos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">
                  Application Photos ({scaffoldApp.photos.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {scaffoldApp.photos.map((photo: string, i: number) => (
                    <img
                      key={i}
                      src={photo}
                      className="h-20 w-20 rounded-md object-cover flex-shrink-0 border"
                      alt="Scaffold app"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Signature & Docs */}
            <div className="flex flex-wrap gap-4 items-center justify-between mt-2">
              <div className="flex gap-2">
                <Badge
                  variant={
                    scaffoldApp.termsAccepted ? "outline" : "destructive"
                  }
                  className="text-[10px]"
                >
                  Terms
                </Badge>
                <Badge
                  variant={
                    scaffoldApp.riskAssessmentAgreed ? "outline" : "destructive"
                  }
                  className="text-[10px]"
                >
                  Risk Assessment
                </Badge>
              </div>

              {scaffoldApp.signatureUrl && (
                <a
                  href={scaffoldApp.signatureUrl}
                  target="_blank"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View Signature →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer Dates */}
        <div className="pt-4 flex justify-between text-[10px] text-muted-foreground">
          <p>ID: {job.id}</p>
          <p>
            LAST UPDATED:{" "}
            {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobDetails;
