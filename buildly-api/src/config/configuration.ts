export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  rendererUrl: process.env.RENDERER_URL ?? 'http://localhost:3001',
  mongodb: { uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/buildly' },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access_secret_dev_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_dev_change_me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@yourapp.io',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
