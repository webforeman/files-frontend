import { NavLink } from 'react-router-dom'

import { File, Files, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useFileStore } from '@/store/files'

export default function Sidebar() {
  const { files } = useFileStore()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <File className="h-6 w-6" />
            <span className="">Filehost</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink
              to="/"
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive ? 'bg-muted' : ''
                )
              }
            >
              <Upload className="h-4 w-4" />
              Upload
            </NavLink>
            <NavLink
              to="/files"
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive ? 'bg-muted' : ''
                )
              }
            >
              <Files className="h-4 w-4" />
              Files
              {files.length > 0 && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {files.length}
                </Badge>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  )
}
