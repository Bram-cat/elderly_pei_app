import { NextRequest, NextResponse } from 'next/server';
import { profilesStorage, jobsStorage } from '@/lib/storage';

// GET /api/profiles/[id] - Get a single profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = profilesStorage.getById(id);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found',
        },
        { status: 404 }
      );
    }

    // Also get their jobs for display
    const jobs = jobsStorage.getByProfileId(id);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        jobs,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/profiles/[id] - Update a profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedProfile = profilesStorage.update(id, body);

    if (!updatedProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
