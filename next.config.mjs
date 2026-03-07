/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      root: 'D:/school-ceo-dashboard review 1/school-ceo-dashboard'
    }
  }
}

export default nextConfig
