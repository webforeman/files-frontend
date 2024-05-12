import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@/global.css'
import { router } from '@/routes'
import { ToastController } from '@/components/custom/toaster/toaster'

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
      <ToastController id="notifications" />
    </StrictMode>
  )
}
