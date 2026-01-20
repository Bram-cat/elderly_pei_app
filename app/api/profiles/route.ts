import { NextRequest, NextResponse } from 'next/server';
import { profilesStorage } from '@/lib/storage';
import { Profile } from '@/lib/types';
import { generateId } from '@/lib/utils';

// GET /api/profiles - Get all profiles with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'youth' or 'senior'

    let profiles = profilesStorage.getAll();

    if (type) {
      profiles = profilesStorage.getByType(type as 'youth' | 'senior');
    }

    return NextResponse.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profiles',
      },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'type'];
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

    // Create new profile
    const newProfile: Profile = {
      id: generateId(),
      name: body.name,
      type: body.type,
      bio: body.bio,
      school: body.school,
      skills: body.skills || [],
      phone: body.phone,
      email: body.email,
      photo: body.photo,
      rating: 0,
      totalJobs: 0,
      totalEarned: body.type === 'youth' ? 0 : undefined,
      totalSpent: body.type === 'senior' ? 0 : undefined,
      favourites: body.type === 'senior' ? [] : undefined,
      joinedAt: new Date().toISOString(),
      neighborhood: body.neighborhood,
    };

    // Save to storage
    const createdProfile = profilesStorage.create(newProfile);

    return NextResponse.json(
      {
        success: true,
        data: createdProfile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create profile',
      },
      { status: 500 }
    );
  }
}
