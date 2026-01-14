import jwt from 'jsonwebtoken';

// Simple user interface for JWT generation
interface UserForToken {
  id: string;
  email: string;
  role?: string;
}

const generateAccessToken = (user: UserForToken): string => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

const generateRefreshToken = (user: UserForToken): string => {
  const payload = {
    sub: user.id,
    email: user.email
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET!, { expiresIn: '30d' });
};

export {
  generateAccessToken,
  generateRefreshToken
};
