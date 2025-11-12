/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/verseny', permanent: true },
    ];
  },
};
export default nextConfig;
