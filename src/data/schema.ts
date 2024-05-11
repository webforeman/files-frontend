import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

export const FileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  lastModified: z.number(),
  id: z.number().optional(),
  iv: z.string().optional(),
  md5: z.string().optional(),
})

export type FilesSchema = z.infer<typeof FileSchema>
