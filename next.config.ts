import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false
      }
    }
    
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource'
    })
    
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource'
    })
    
    return config
  },
  images: {
    domains: ['placehold.co'],
    unoptimized: true
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

export default nextConfig