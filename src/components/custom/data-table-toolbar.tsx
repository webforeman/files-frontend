import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

import { useFileStore } from '@/store/files'
import { Button } from '@/components/ui/button'
interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { downloadZip } = useFileStore((state) => ({
    downloadZip: state.downloadZip,
  }))
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Find file..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <Button
          variant="outline"
          size="sm"
          className="my-2 h-8 lg:flex"
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          onClick={() => {
            const selected: { original: TData }[] =
              table.getFilteredSelectedRowModel().rows
            downloadZip(
              selected.map(
                ({ original }: { original: TData }) =>
                  (original as { id: number })?.id
              )
            )
          }}
        >
          Download selected files
        </Button>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
