import { createBrowserRouter } from 'react-router-dom'
import UploadPage from './upload'
import FilesPage from './files'
import ErrorPage from './error'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UploadPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/files',
    element: <FilesPage />,
  },
])
