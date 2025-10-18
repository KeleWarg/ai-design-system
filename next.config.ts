import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@supabase/supabase-js', '@supabase/ssr'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/supabase-js': require.resolve('@supabase/supabase-js'),
    }
    return config
  },
};

export default nextConfig;
