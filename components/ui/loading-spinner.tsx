export function LoadingSpinner() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-75">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin shadow-lg"></div>
          <span className="mt-2 text-sm font-medium text-primary">Loading...</span>
        </div>
      </div>
    )
  }
  