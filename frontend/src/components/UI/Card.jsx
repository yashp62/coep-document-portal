import { cn } from '../../utils/cn'

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('bg-white shadow rounded-lg', className)}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', className)}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
