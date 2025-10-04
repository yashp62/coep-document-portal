import { cn } from '../../utils/cn'

const SkeletonLoader = ({ className = '', ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded-md',
        className
      )}
      {...props}
    />
  )
}

const DocumentCardSkeleton = () => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* File icon skeleton */}
          <SkeletonLoader className="w-10 h-10 rounded" />
          
          <div className="flex-1 space-y-3">
            {/* Title skeleton */}
            <SkeletonLoader className="h-5 w-3/4" />
            
            {/* Description skeleton */}
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-2/3" />
            
            {/* Metadata skeleton */}
            <div className="flex items-center space-x-6 mt-3">
              <SkeletonLoader className="h-3 w-20" />
              <SkeletonLoader className="h-3 w-24" />
              <SkeletonLoader className="h-3 w-16" />
            </div>
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex gap-2 ml-4">
          <SkeletonLoader className="w-20 h-8 rounded-md" />
          <SkeletonLoader className="w-16 h-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}

const DocumentGridSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <DocumentCardSkeleton key={index} />
      ))}
    </div>
  )
}

SkeletonLoader.DocumentCard = DocumentCardSkeleton
SkeletonLoader.DocumentGrid = DocumentGridSkeleton

export default SkeletonLoader