import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CardContent, CardFooter, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect } from 'react'
import * as Progress from '@radix-ui/react-progress'
import { X } from 'lucide-react'
import { useFileStore } from '@/store/files'
import { useProgressStore } from '@/store/progress'
import { useErrorStore } from '@/store/errors'

export default function FileUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputFiles, setInputFiles] = useState<File[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const MAX_FILES = 100 // Maximum number of files
  const MAX_FILE_SIZE = 256 * 1024 * 1024 // Maximum file size in bytes
  const { uploadProgress } = useProgressStore((state) => state)
  const { addError, clearErrors } = useErrorStore((state) => ({
    addError: state.addError,
    clearErrors: state.clearErrors,
  }))

  const { uploadFiles } = useFileStore((state) => ({
    files: state.files,
    uploadFiles: state.uploadFiles,
  }))

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const newFiles = Array.from(e.dataTransfer.files)
    setInputFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newFiles = Array.from(e.target.files as FileList) as File[]
      const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE)
      if (validFiles.length + inputFiles.length > MAX_FILES) {
        throw new Error(`Maximum number of files: ${MAX_FILES}.`)
      }
      if (newFiles.some((file) => file.size > MAX_FILE_SIZE)) {
        throw new Error(`Maximum file size: ${MAX_FILE_SIZE / 1024 / 1024} Mb.`)
      }
      setInputFiles((prevFiles) => [...prevFiles, ...newFiles])
    } catch (error) {
      addError(error as Error)
      // Clear input field
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = (name: string) => {
    const updatedFiles = inputFiles.filter((file) => file.name !== name)
    setInputFiles(updatedFiles)

    const dataTransfer = new DataTransfer()
    updatedFiles.forEach((file) => dataTransfer.items.add(file))
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    await uploadFiles(inputFiles)
  }

  useEffect(() => {
    return () => {
      // Очистка таймера при размонтировании компонента
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (uploadProgress === 100) {
      timeoutRef.current = setTimeout(() => {
        setInputFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 300)
    }
  }, [uploadProgress])

  return (
    <form
      id="uploadZipForm"
      encType="multipart/form-data"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <Label
            className="cursor-pointer text-sm font-medium"
            htmlFor="zipFiles"
          >
            <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center">
              <FileIcon className="w-12 h-12" />
              <span className="text-sm font-medium text-gray-500">
                Drag and drop file or click to select
              </span>
              <span className="text-xs text-gray-500">
                Only ZIP files are supported (Max file size 256 MB, Max file
                count 100)
              </span>
            </div>
          </Label>
          <div className="space-y-2 text-sm">
            <span className="text-xs text-gray-500">ZIP file(s)</span>
            <Input
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".zip,application/zip,application/x-zip-compressed"
              id="zipFiles"
              name="zipFiles"
              placeholder="ZIP file"
              className="cursor-pointer h-fit"
              type="file"
              multiple
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col">
          <Button
            className={inputFiles.length === 0 ? 'cursor-not-allowed' : ''}
            size="lg"
            disabled={inputFiles.length === 0 || uploadProgress > 0}
            type="submit"
            onClick={
              inputFiles.length > 0 && uploadProgress === 0
                ? handleUpload
                : () => {}
            }
          >
            Upload
          </Button>
          {inputFiles.length > 0 && (
            <div className="py-2">
              <div className="w-full h-[16px] my-2 bg-[#fff]">
                <Progress.Root
                  className="w-full h-[16px] mt-2 bg-[#fff] rounded-[99999px] overflow-hidden translate-z-0"
                  value={Math.round(uploadProgress)}
                >
                  <Progress.Indicator
                    className="w-full h-full transition-transform duration-150 ease-in"
                    style={{
                      background: 'hsl(var(--primary))',
                      transform: `translateX(-${
                        100 - Math.round(uploadProgress)
                      }%)`,
                    }}
                  />
                </Progress.Root>
              </div>
              <ul className="space-y-2">
                {inputFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex justify-between items-center gap-2"
                  >
                    {file.name}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveFile(file.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}
