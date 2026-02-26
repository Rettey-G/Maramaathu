export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#2d3748]">
      <div className="text-center text-white">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <div className="text-sm">Loading...</div>
      </div>
    </div>
  )
}
