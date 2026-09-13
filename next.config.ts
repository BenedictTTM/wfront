import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/signin",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
