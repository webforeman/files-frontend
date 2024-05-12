import { create } from 'zustand'

interface File extends Blob {
  id?: number
  name: string
  type: string
  size: number
  lastModified: number
}

interface FileState {
  error: Error | null
  encryptionKey: CryptoKey | null
  files: File[]
  fetchFiles: () => Promise<void>
  uploadFiles: (files: File[]) => Promise<void>
  downloadFile: (id: number) => Promise<void>
  downloadZip: (ids: number[]) => Promise<void>
  deleteFile: (id: number) => Promise<void>
  generateEncryptionKey: () => Promise<void>
  initializeCryptoOperations: () => Promise<void>
  encryptFile: (file: File, iv: Uint8Array) => Promise<ArrayBuffer | undefined>
  decryptFile: (file: File, iv: Uint8Array) => Promise<ArrayBuffer | undefined>
  generateKey: () => Promise<void>
  importKey: (encodedKey: string) => Promise<void>
  uploadProgress: number
}

const useFileStore = create<FileState>((set, get) => ({
  files: [],
  error: null,
  encryptionKey: null,
  uploadProgress: 0,
  fetchFiles: async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      set({ files: data })
    } catch (error) {
      console.error(error)
      set({ error: error as Error })
    }
  },
  uploadFiles: async (files: File[]) => {
    try {
      const formData = new FormData()

      for (const file of files) {
        // const iv = window.crypto.getRandomValues(new Uint8Array(16))
        // const encryptedData = await get().encryptFile(file, iv)
        // if (encryptedData) {
        formData.append('files', new Blob([file]), file.name)

        formData.append('fileNames', file.name)
        formData.append('filesLastModified', file.lastModified.toString())

        // Преобразование IV в строку Base64
        // const ivString = btoa(String.fromCharCode(...iv))
        // Массив с IV строками в Base64
        // formData.append(`IVs`, ivString)
        // } else {
        //   throw new Error('Encryption failed: Data is undefined')
        // }
      }

      const xhr = new XMLHttpRequest()

      xhr.open('POST', `/api/upload`, true)

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          set({ uploadProgress: progress })
        }
      }

      xhr.onload = function () {
        try {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.response)
            console.log('xhr.data.files', data.files)

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
                uploadProgress: 0,
              }
            })
          } else {
            throw new Error('Network response was not ok')
          }
        } catch (error) {
          console.error(error)
          set({ error: error as Error })
        }
      }

      xhr.onerror = function () {
        const error = new Error('Network error occurred')
        console.error(error)
        set({ error })
      }

      xhr.send(formData)
      set({ uploadProgress: 0 })
    } catch (error) {
      console.error(error)
      set({ error: error as Error })
    }
  },
  downloadFile: async (id: number) => {
    try {
      const response = await fetch(`/api/file/${id}`)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()

      const filename = response.headers.get('X-Filename') || 'downloadFile.zip'

      // const { name, path, iv } = await response.json()
      // const blobResponse = await fetch(path)
      // const blob = await blobResponse.blob()
      // console.log('iv', iv)

      // const decryptedData = await get().decryptFile(
      //   new File([blob], 'downloadedFile'),
      //   iv
      // )
      // if (!decryptedData) {
      //   throw new Error('Decryption failed')
      // }

      // const decryptedBlob = new Blob([decryptedData])
      // const url = window.URL.createObjectURL(decryptedBlob)
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
      set({ error: error as Error })
    }
  },
  downloadZip: async (ids: number[]) => {
    try {
      // Изменение курсора на всей странице
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
      a.download = 'files.zip' // Название для скачиваемого файла
      document.body.appendChild(a)
      // Восстановление стандартного курсора
      document.body.style.cursor = 'default'
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('Error downloading zip:', error)
      set({ error: error as Error })
      // Восстановление стандартного курсора в случае ошибки
      document.body.style.cursor = 'default'
    }
  },
  deleteFile: async (id: number) => {
    try {
      const response = await fetch(`/api/file/${id}`, {
        method: 'DELETE',
      })
      console.log('delete response', response)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      set((state) => ({ files: state.files.filter((file) => file.id !== id) }))
    } catch (error) {
      console.error(error)
      set({ error: error as Error })
    }
  },
  generateEncryptionKey: async () => {
    await get().generateKey()
  },
  initializeCryptoOperations: async () => {
    const storedKey = localStorage.getItem('encryptionKey')
    if (storedKey) {
      await get().importKey(storedKey)
    } else {
      await get().generateKey()
    }
  },
  encryptFile: async (file: File, iv: Uint8Array) => {
    try {
      const encryptionKey = get().encryptionKey
      if (!encryptionKey) {
        throw new Error('Encryption key is not available')
      }
      const arrayBuffer = await file.arrayBuffer()
      return window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        arrayBuffer
      )
    } catch (error) {
      console.error(error)
      set({ error: error as Error })
    }
  },
  decryptFile: async (file: File, iv: Uint8Array) => {
    try {
      const encryptionKey = get().encryptionKey
      if (!encryptionKey) {
        throw new Error('Encryption key is not available')
      }
      const encryptedData = await file.arrayBuffer()
      return window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        encryptedData
      )
    } catch (error) {
      console.error(error)
      set({ error: error as Error })
    }
  },
  generateKey: async () => {
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    const exportedKey = await window.crypto.subtle.exportKey('raw', key)
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
    localStorage.setItem('encryptionKey', keyBase64)
    set((state) => ({ ...state, encryptionKey: key }))
  },
  importKey: async (encodedKey: string) => {
    const rawKey = Uint8Array.from(atob(encodedKey), (c) => c.charCodeAt(0))
    const key = await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    set((state) => ({ ...state, encryptionKey: key }))
  },
}))

useFileStore.getState().initializeCryptoOperations()
useFileStore.getState().fetchFiles()

export default useFileStore
