export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center">
        <div className="text-6xl animate-bounce">🏆</div>
        <div className="text-xl font-semibold">Loading OodaBoard...</div>
        <div className="text-sm text-muted-foreground">Calculating your achievements</div>
      </div>
    </div>
  )
}
