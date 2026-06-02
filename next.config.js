/** @type {import('next').NextConfig} */
const nextConfig = {
  // No custom server.js needed — Socket.IO runs as a SEPARATE service
  // Deploy socket-server/ to Render/Railway/Fly, this app to Vercel
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
};
module.exports = nextConfig;
