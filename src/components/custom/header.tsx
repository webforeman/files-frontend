import { NavLink } from 'react-router-dom'

import { File, Files, Menu, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export default function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 lg:pt-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-3">
          <nav className="grid gap-2 text-lg font-medium">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <File className="h-6 w-6" />
              <span>Filehost</span>
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                  isActive ? 'bg-muted' : ''
                )
              }
            >
              <Upload className="h-5 w-5" />
              Upload
            </NavLink>
            <NavLink
              to="/files"
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                  isActive ? 'bg-muted' : ''
                )
              }
            >
              <Files className="h-5 w-5" />
              Files
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                6
              </Badge>
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
