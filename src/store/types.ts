export interface File extends Blob {
  id?: number
  name: string
  type: string
  size: number
  lastModified: number
}
export interface FileState {
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

export interface FileStore {
  set: (
    partial: Partial<FileState> | ((state: FileState) => Partial<FileState>)
  ) => void
  get: () => FileState
}
