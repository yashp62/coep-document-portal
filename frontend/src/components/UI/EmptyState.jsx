import { FileText, Search, Upload, Filter } from 'lucide-react'
import Button from './Button'

const EmptyState = ({ 
  icon: Icon = FileText,
  title,
  description,
  action,
  actionLabel,
  onAction,
  variant = 'default'
}) => {
  const variants = {
    default: 'text-gray-400',
    search: 'text-blue-400',
    upload: 'text-green-400'
  }

  return (
    <div className="text-center py-12">
      <Icon className={`mx-auto h-16 w-16 ${variants[variant]} mb-4`} />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
const NoDocumentsFound = ({ hasFilters, onClearFilters, onUpload, canUpload }) => (
  <EmptyState
    icon={hasFilters ? Search : FileText}
    title={hasFilters ? "No documents match your search" : "No documents available"}
    description={
      hasFilters 
        ? "Try adjusting your search terms or filters to find what you're looking for."
        : "There are no documents available yet. Upload the first document to get started."
    }
    action={hasFilters ? onClearFilters : (canUpload ? onUpload : null)}
    actionLabel={hasFilters ? "Clear filters" : "Upload Document"}
    variant={hasFilters ? 'search' : 'upload'}
  />
)

const NoSearchResults = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={`No documents found for "${searchTerm}". Try different keywords or browse all documents.`}
    action={onClearSearch}
    actionLabel="Clear search"
    variant="search"
  />
)

const NoMyDocuments = ({ onUpload }) => (
  <EmptyState
    icon={Upload}
    title="You haven't uploaded any documents yet"
    description="Start sharing knowledge by uploading your first document. Your uploads will appear here for easy management."
    action={onUpload}
    actionLabel="Upload Your First Document"
    variant="upload"
  />
)

EmptyState.NoDocuments = NoDocumentsFound
EmptyState.NoSearchResults = NoSearchResults
EmptyState.NoMyDocuments = NoMyDocuments

export default EmptyState