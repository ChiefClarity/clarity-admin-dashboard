import { logger } from '@/lib/utils/logger';

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  async getValidToken(): Promise<string | null> {
    // Check if token exists and is still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Try to refresh if we have a refresh token
    if (this.refreshToken) {
      try {
        await this.refreshTokens();
        return this.token;
      } catch (error) {
        logger.error('Failed to refresh token', error);
        return null;
      }
    }

    return null;
  }

  async refreshTokens(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken, data.expiresIn);
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    // Set expiry 1 minute before actual expiry to ensure we refresh in time
    this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
  }

  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      this.clearTokens();
      window.location.href = '/login';
    }
  }
}

export const authService = new AuthService();