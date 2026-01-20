import { NextRequest, NextResponse } from 'next/server';
import { reviewsStorage } from '@/lib/storage';
import { Review } from '@/lib/types';
import { generateId } from '@/lib/utils';

// GET /api/reviews - Get reviews with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const profileId = searchParams.get('profileId');

    let reviews = reviewsStorage.getAll();

    if (jobId) {
      reviews = reviewsStorage.getByJobId(jobId);
    } else if (profileId) {
      reviews = reviewsStorage.getByProfileId(profileId);
    }

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['jobId', 'reviewerId', 'revieweeId', 'rating', 'comment'];
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

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating must be between 1 and 5',
        },
        { status: 400 }
      );
    }

    // Create new review
    const newReview: Review = {
      id: generateId(),
      jobId: body.jobId,
      reviewerId: body.reviewerId,
      revieweeId: body.revieweeId,
      rating: body.rating,
      comment: body.comment,
      createdAt: new Date().toISOString(),
    };

    // Save to storage (this will also update profile rating)
    const createdReview = reviewsStorage.create(newReview);

    return NextResponse.json(
      {
        success: true,
        data: createdReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create review',
      },
      { status: 500 }
    );
  }
}
