import express from 'express';
import { Request, Response } from 'express';
import UserService from '../services/userService.js';
import { requireUser } from './middlewares/auth.js';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import jwt from 'jsonwebtoken';
import { ALL_ROLES } from 'shared';

const router = express.Router();

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

router.post('/login', async (req: Request, res: Response) => {
  const sendError = (msg: string) => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  try {
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Update refresh token in database
      await UserService.update(user.id, { refresh_token: refreshToken });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        ...userWithoutPassword,
        accessToken,
        refreshToken
      });
    } else {
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error('[AuthRoutes] Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Description: User registration (DISABLED - Admin only user creation)
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string, name?: string }
// Response: { error: string }
router.post('/register', async (req: AuthRequest, res: Response) => {
  console.log('[AuthRoutes] Registration attempt blocked - public registration is disabled');
  return res.status(403).json({
    error: 'Public registration is disabled. Please contact an administrator to create an account.'
  });
});

router.post('/logout', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await UserService.getByEmail(email);
    if (user) {
      await UserService.update(user.id, { refresh_token: '' });
    }

    res.status(200).json({ message: 'User logged out successfully.' });
  } catch (error) {
    console.error('[AuthRoutes] Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;

    // Find the user
    const user = await UserService.get(decoded.sub as string);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.refresh_token !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user's refresh token in database
    await UserService.update(user.id, { refresh_token: newRefreshToken });

    // Return new tokens
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error(`Token refresh error: ${errorMessage}`);

    if (errorName === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

router.get('/me', requireUser(ALL_ROLES), async (req: AuthRequest, res: Response) => {
  return res.status(200).json(req.user);
});

export default router;
