import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TodoLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto mb-4" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Search Card Skeleton */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Todo Form Skeleton */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Pagination Skeleton */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Todo List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-5 w-5 mt-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
