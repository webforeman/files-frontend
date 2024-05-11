import { ClientLayout } from '@/components/custom/client-layout'
import { columns } from '@/components/custom/columns'
import { DataTable } from '@/components/custom/data-table'
import { Button } from '@/components/ui/button'
import useFileStore from '@/store'
import { useNavigate } from 'react-router-dom'

export default function FilesPage() {
  const navigate = useNavigate()

  const navigateToPage = () => {
    navigate('/')
  }

  const { files } = useFileStore((state) => ({
    error: state.error,
    files: state.files,
  }))

  return (
    <ClientLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Files list</h1>
      </div>
      {files.length <= 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no files
            </h3>
            <p className="text-sm text-muted-foreground">
              You can start hosting as soon as you add a files.
            </p>
            <Button onClick={navigateToPage} className="mt-4">
              Add files
            </Button>
          </div>
        </div>
      ) : (
        <DataTable data={files} columns={columns} />
      )}
    </ClientLayout>
  )
}
