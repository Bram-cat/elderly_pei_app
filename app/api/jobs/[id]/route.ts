import { NextRequest, NextResponse } from 'next/server';
import { jobsStorage } from '@/lib/storage';

// GET /api/jobs/[id] - Get a single job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = jobsStorage.getById(params.id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update a job (for accepting, completing, cancelling)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const job = jobsStorage.getById(params.id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      );
    }

    // Handle status changes with timestamps
    const updates: any = { ...body };

    if (body.status === 'accepted' && !job.acceptedAt) {
      updates.acceptedAt = new Date().toISOString();
    }

    if (body.status === 'completed' && !job.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    // Update the job
    const updatedJob = jobsStorage.update(params.id, updates);

    if (!updatedJob) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update job',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update job',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = jobsStorage.delete(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Job deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete job',
      },
      { status: 500 }
    );
  }
}
