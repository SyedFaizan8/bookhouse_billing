import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/backend/:path*',
                destination: 'http://127.0.0.1:4000/api/:path*'
            },
            {
                source: "/uploads/:path*",
                destination: "http://127.0.0.1:4000/uploads/:path*",
            },
        ]
    }
};

export default nextConfig;
