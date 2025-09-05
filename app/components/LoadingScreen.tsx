'use client'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">3D CAR RACING</h1>
        <p className="text-xl text-cyan-300">Loading Game Engine...</p>
        <div className="mt-8">
          <div className="bg-gray-800 rounded-full h-2 w-64 mx-auto">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  )
}