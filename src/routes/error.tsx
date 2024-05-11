import { Link } from 'react-router-dom'
import { useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <div
      id="error-page"
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-10">
        Ups, something went wrong...
      </h1>
      <Link
        to="/"
        className="font-medium text-primary underline underline-offset-4"
      >
        Go back to home
      </Link>
    </div>
  )
}
