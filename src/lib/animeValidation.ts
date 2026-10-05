import { z } from 'zod'

const animeStatuses = ['Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'] as const

const createAnimeStatuses = ['Watching', 'Plan to Watch', 'On Hold', 'Dropped'] as const

const websiteSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value.length === 0) {
        return true
      }

      try {
        const url = new URL(value)

        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    },
    {
      message: 'Website must be a valid HTTP or HTTPS URL.',
    },
  )

export const animeStatusSchema = z.enum(animeStatuses)

export const createAnimeStatusSchema = z.enum(createAnimeStatuses)

export const createAnimeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(255, 'Title must not exceed 255 characters.'),

  description: z.string().trim().max(5000, 'Description must not exceed 5000 characters.'),

  episodes: z
    .number()
    .int('Episodes must be a whole number.')
    .positive('Episodes must be greater than 0.'),

  status: createAnimeStatusSchema,

  isFavorite: z.boolean(),

  websiteUrl: websiteSchema,

  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type.startsWith('image/'), {
      message: 'Image must be a valid image file.',
    })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Image must not exceed 5 MB.',
    }),
})

export const updateAnimeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(255, 'Title must not exceed 255 characters.')
    .optional(),

  description: z
    .string()
    .trim()
    .max(5000, 'Description must not exceed 5000 characters.')
    .optional(),

  episodes: z
    .number()
    .int('Episodes must be a whole number.')
    .positive('Episodes must be greater than 0.')
    .optional(),

  status: animeStatusSchema.optional(),

  isFavorite: z.boolean().optional(),

  websiteUrl: websiteSchema.optional(),

  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type.startsWith('image/'), {
      message: 'Image must be a valid image file.',
    })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Image must not exceed 5 MB.',
    }),
})

export type CreateAnimeForm = z.infer<typeof createAnimeSchema>
export type UpdateAnimeForm = z.infer<typeof updateAnimeSchema>
