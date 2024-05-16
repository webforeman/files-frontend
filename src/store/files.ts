import { create } from 'zustand'
import { useErrorStore } from './errors'
import { useProgressStore } from './progress'

interface File extends Blob {
  id?: number
  name: string
  type: string
  size: number
  lastModified: number
}

interface FileStateStore {
  files: File[]
  fetchFiles: () => Promise<void>
  uploadFiles: (files: File[]) => Promise<void>
  downloadFile: (id: number) => Promise<void>
  downloadZip: (ids: number[]) => Promise<void>
  deleteFile: (id: number) => Promise<void>
}

export const useFileStore = create<FileStateStore>((set) => ({
  files: [],
  fetchFiles: async () => {
    useErrorStore.getState().clearErrors() // Clear errors before fetching files
    try {
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      set({ files: data })
    } catch (error) {
      console.error(error)
      useErrorStore.getState().addError(error as Error)
    }
  },
  uploadFiles: async (files: File[]) => {
    useErrorStore.getState().clearErrors() // Clear errors before uploading files
    const { setUploadProgress } = useProgressStore.getState()
    setUploadProgress(0) // Start progress
    try {
      const formData = new FormData()

      for (const file of files) {
        formData.append(
          'files',
          new Blob([file]),
          encodeURIComponent(file.name)
        )
        formData.append('fileNames', encodeURIComponent(file.name))
        formData.append('filesLastModified', file.lastModified.toString())
      }

      const xhr = new XMLHttpRequest()

      xhr.open('POST', `/api/upload`, true)

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadProgress(progress)
        }
      }

      xhr.onload = function () {
        try {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.response)

            set((state) => {
              const newFiles = [
                ...data.files, // Сначала добавляем все файлы из data.files
                ...state.files.filter(
                  (stateFile) =>
                    !data.files.some(
                      (dataFile: File) => dataFile.name === stateFile.name
                    )
                ), // Добавляем только те файлы из state.files, которых нет в data.files по свойству name
              ]
              return {
                files: newFiles,
              }
            })
          } else {
            throw new Error('Network response was not ok')
          }
        } catch (error) {
          console.error(error)
          useErrorStore.getState().addError(error as Error)
        }
      }

      xhr.onerror = function () {
        const error = new Error('Network error occurred')
        console.error(error)
        useErrorStore.getState().addError(error as Error)
      }

      xhr.send(formData)
      setUploadProgress(100)
    } catch (error) {
      console.error(error)
      useErrorStore.getState().addError(error as Error)
      setUploadProgress(0)
    }
  },
  downloadFile: async (id: number) => {
    useErrorStore.getState().clearErrors()
    try {
      const response = await fetch(`/api/file/${id}`)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()

      const filename = response.headers.get('X-Filename') || 'downloadFile.zip'
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error(error)
      useErrorStore.getState().addError(error as Error)
    }
  },
  downloadZip: async (ids: number[]) => {
    useErrorStore.getState().clearErrors()
    try {
      // Change cursor to all page
      document.body.style.cursor = 'wait'
      const response = await fetch('/api/files/zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        throw new Error('Failed to download zip file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'files.zip' // Name for download packed group files
      document.body.appendChild(a)
      // Reset cursor to default
      document.body.style.cursor = 'default'
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('Error downloading zip:', error)
      useErrorStore.getState().addError(error as Error)
      // Reset cursor to default
      document.body.style.cursor = 'default'
    }
  },
  deleteFile: async (id: number) => {
    useErrorStore.getState().clearErrors()
    try {
      const response = await fetch(`/api/file/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      set((state) => ({ files: state.files.filter((file) => file.id !== id) }))
    } catch (error) {
      console.error(error)
      useErrorStore.getState().addError(error as Error)
    }
  },
}))

useFileStore.getState().fetchFiles()
