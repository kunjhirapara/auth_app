import { NextResponse } from 'next/server';
import { deleteRefreshToken, blacklistAccessToken } from '@/lib/redis';
import { verifyAccessToken, getAccessTokenExpiry } from '@/lib/jwt';

export async function POST(request) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Get access token from header or cookie
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : request.cookies.get('accessToken')?.value;

    // Delete refresh token from Redis
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    // Blacklist access token if provided
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        // Blacklist for the remaining time of the token
        await blacklistAccessToken(accessToken, getAccessTokenExpiry());
      }
    }

    // Clear both cookies
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('accessToken', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
