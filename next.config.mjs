/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/verseny',
        permanent: false, // 307 – ne cache-elje örökre
      },
    ];
  },
};

export default nextConfig;