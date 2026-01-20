import Link from "next/link";
import { Job } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryInfo, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatRelativeDate, truncateText } from "@/lib/utils";
import { Clock, MapPin, DollarSign } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const categoryInfo = getCategoryInfo(job.category);
  const statusColor = JOB_STATUS_COLORS[job.status];
  const statusLabel = JOB_STATUS_LABELS[job.status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <Badge variant="outline">{categoryInfo.label}</Badge>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(job.pay)}
            </div>
            <div className="text-xs text-muted-foreground">CAD</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {truncateText(job.description, 120)}
        </p>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location.neighborhood || job.location.address}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Posted {formatRelativeDate(job.postedAt)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/job/${job.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
