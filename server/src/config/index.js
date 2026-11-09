import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5174',
  jwtSecret: process.env.JWT_SECRET || 'bhromon_secret_jwt_key_crm_2026_super_secure_enterprise_token',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'bhromon_admin_token',
  defaultTaxRate: parseFloat(process.env.DEFAULT_TAX_RATE || '0.05'),
  defaultCommissionRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE || '0.10'),
};

export default config;
