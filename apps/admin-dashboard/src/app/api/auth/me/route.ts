import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check for auth cookie or header
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production, verify JWT and get user from database
    // For now, return mock user if token exists
    if (token === 'mock-token') {
      return NextResponse.json({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'csm@claritypool.com',
        firstName: 'Sarah',
        lastName: 'CSM',
        role: 'CSM',
        permissions: ['bookings:read', 'bookings:write', 'technicians:read'],
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}