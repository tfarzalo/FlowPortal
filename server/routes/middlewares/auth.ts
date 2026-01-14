import UserService, { IUser } from '../../services/userService';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ALL_ROLES } from 'shared';

interface AuthRequest extends Request {
  user?: IUser;
}

const requireUser = (allowedRoles: string[] = ALL_ROLES) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check for token in Authorization header first, then query parameter
    let token = req.headers.authorization?.split(' ')[1];

    // Fallback to query parameter for direct downloads (e.g., new window/tab downloads)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      const user = await UserService.get(decoded.sub as string);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // If roles are specified, check if user has one of the allowed roles
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      req.user = user;
      next();
    } catch {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };
};

export {
  requireUser,
};
