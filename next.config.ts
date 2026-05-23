import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
    ],
  },
};

export default withPWA({
  dest: 'public',

  register: true,

  skipWaiting: true,

  disable:
    process.env.NODE_ENV ===
    'development',

  runtimeCaching: [
    {
      urlPattern:
        /^https:\/\/.*\.supabase\.co\/rest\/v1\/flights/,

      handler:
        'StaleWhileRevalidate',

      options: {
        cacheName:
          'flight-search-cache',
      },
    },

    {
      urlPattern:
        /\.(?:png|jpg|jpeg|svg|gif|webp)$/,

      handler:
        'CacheFirst',

      options: {
        cacheName:
          'image-cache',

        expiration: {
          maxEntries: 100,

          maxAgeSeconds:
            60 * 60 * 24 * 30,
        },
      },
    },
  ],
})(nextConfig);