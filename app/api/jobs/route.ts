import { NextRequest, NextResponse } from 'next/server';
import { jobsStorage } from '@/lib/storage';
import { Job, JobFilters } from '@/lib/types';
import { generateId } from '@/lib/utils';

// GET /api/jobs - Get all jobs with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get all jobs
    let jobs = jobsStorage.getAll();

    // Apply filters
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const minPay = searchParams.get('minPay');
    const maxPay = searchParams.get('maxPay');
    const timePreference = searchParams.get('timePreference');

    if (category) {
      jobs = jobs.filter((job) => job.category === category);
    }

    if (status) {
      jobs = jobs.filter((job) => job.status === status);
    }

    if (minPay) {
      jobs = jobs.filter((job) => job.pay >= parseInt(minPay));
    }

    if (maxPay) {
      jobs = jobs.filter((job) => job.pay <= parseInt(maxPay));
    }

    if (timePreference) {
      jobs = jobs.filter((job) => job.timePreference === timePreference);
    }

    // Sort by newest first
    jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'location', 'timePreference', 'pay', 'postedBy'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Create new job
    const newJob: Job = {
      id: generateId(),
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      timePreference: body.timePreference,
      scheduledDate: body.scheduledDate,
      pay: body.pay,
      photos: body.photos || [],
      postedBy: body.postedBy,
      postedAt: new Date().toISOString(),
      status: 'open',
    };

    // Save to storage
    const createdJob = jobsStorage.create(newJob);

    return NextResponse.json(
      {
        success: true,
        data: createdJob,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create job',
      },
      { status: 500 }
    );
  }
}
