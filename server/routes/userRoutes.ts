import express from 'express';
import { Request, Response } from 'express';
import UserService, { CreateUserData, IUser } from '../services/userService';
import { requireUser } from './middlewares/auth';

const router = express.Router();

interface AuthRequest extends Request {
  user?: IUser;
}

// Description: Get all users (admin only)
// Endpoint: GET /api/users
// Request: {}
// Response: { users: Array<User> }
router.get('/', requireUser(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('[UserRoutes] Fetching all users');
    const users = await UserService.list();
    console.log(`[UserRoutes] Retrieved ${users.length} users`);
    return res.status(200).json({ users });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[UserRoutes] Error fetching users: ${errorMessage}`);
    return res.status(500).json({ error: errorMessage });
  }
});

// Description: Get user by ID (admin only)
// Endpoint: GET /api/users/:id
// Request: {}
// Response: { user: User }
router.get('/:id', requireUser(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[UserRoutes] Fetching user with ID: ${id}`);
    const user = await UserService.get(id);

    if (!user) {
      console.log(`[UserRoutes] User not found: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[UserRoutes] User retrieved: ${user.email}`);
    return res.status(200).json({ user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[UserRoutes] Error fetching user: ${errorMessage}`);
    return res.status(500).json({ error: errorMessage });
  }
});

// Description: Create new user (admin only)
// Endpoint: POST /api/users
// Request: { email: string, password: string, name?: string, role?: string }
// Response: { user: User }
router.post('/', requireUser(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      console.log('[UserRoutes] Missing required fields for user creation');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`[UserRoutes] Creating new user: ${email}`);
    const userData: CreateUserData = { email, password, name, role };

    const user = await UserService.create(userData);
    console.log(`[UserRoutes] User created successfully: ${user.email}`);
    return res.status(201).json({ user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[UserRoutes] Error creating user: ${errorMessage}`);
    return res.status(400).json({ error: errorMessage });
  }
});

// Description: Update user (admin only)
// Endpoint: PUT /api/users/:id
// Request: { email?: string, name?: string, role?: string, password?: string }
// Response: { user: User }
router.put('/:id', requireUser(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { password, ...updates } = req.body;

    console.log(`[UserRoutes] Updating user: ${id}`);

    // If password is provided, hash it first
    if (password) {
      const user = await UserService.get(id);
      if (!user) {
        console.log(`[UserRoutes] User not found for update: ${id}`);
        return res.status(404).json({ error: 'User not found' });
      }
      await UserService.setPassword(user.id, password);
      console.log(`[UserRoutes] Password updated for user: ${id}`);
    }

    // Update other fields
    const updatedUser = await UserService.update(id, updates);

    if (!updatedUser) {
      console.log(`[UserRoutes] User not found for update: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[UserRoutes] User updated successfully: ${updatedUser.email}`);
    return res.status(200).json({ user: updatedUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[UserRoutes] Error updating user: ${errorMessage}`);
    return res.status(400).json({ error: errorMessage });
  }
});

// Description: Delete user (admin only)
// Endpoint: DELETE /api/users/:id
// Request: {}
// Response: { success: boolean }
router.delete('/:id', requireUser(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[UserRoutes] Deleting user: ${id}`);

    // Prevent deleting yourself
    if (req.user?.id === id) {
      console.log('[UserRoutes] Cannot delete your own account');
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const success = await UserService.delete(id);

    if (!success) {
      console.log(`[UserRoutes] User not found for deletion: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[UserRoutes] User deleted successfully: ${id}`);
    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[UserRoutes] Error deleting user: ${errorMessage}`);
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;
