import { ref } from 'vue'
import { apiFetch } from './api'

export type AnimeStatus = 'Watching' | 'Completed' | 'Plan to Watch' | 'On Hold' | 'Dropped'

export interface Anime {
  id: number
  userId: number
  title: string
  description: string
  imageUrl: string
  imagePublicId: string
  episodes: number
  progress: number
  status: AnimeStatus
  isFavorite: boolean
  websiteUrl: string
  createdAt: string
  updatedAt: string
}

export interface AddAnimeData {
  title: string
  description: string
  episodes: number
  status: AnimeStatus
  isFavorite: boolean
  websiteUrl: string
  image?: File
}

export interface UpdateAnimeData {
  title?: string
  description?: string
  episodes?: number
  status?: AnimeStatus
  isFavorite?: boolean
  websiteUrl?: string
  image?: File
}

interface ApiAnime {
  id: number
  user_id: number
  title: string
  description: string | null
  image_url: string | null
  image_public_id: string | null
  episodes: number
  progress: number
  status: AnimeStatus
  is_favorite: boolean
  website_url: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  message: string
  data: T
}

const animeList = ref<Anime[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const FALLBACK_IMAGE = 'https://placehold.co/400x600?text=Anime'

let loadPromise: Promise<void> | null = null
let hasLoaded = false

function mapAnime(anime: ApiAnime): Anime {
  return {
    id: anime.id,
    userId: anime.user_id,
    title: anime.title,
    description: anime.description ?? '',
    imageUrl: anime.image_url ?? FALLBACK_IMAGE,
    imagePublicId: anime.image_public_id ?? '',
    episodes: anime.episodes,
    progress: anime.progress,
    status: anime.status,
    isFavorite: anime.is_favorite,
    websiteUrl: anime.website_url ?? '',
    createdAt: anime.created_at,
    updatedAt: anime.updated_at,
  }
}

function getAnimeById(id: number) {
  return animeList.value.find((anime) => anime.id === id)
}

async function loadAnimeList(force = false): Promise<void> {
  if (loadPromise && !force) {
    return loadPromise
  }

  if (hasLoaded && !force) {
    return
  }

  isLoading.value = true
  error.value = null

  loadPromise = (async () => {
    try {
      const response = await apiFetch<ApiResponse<ApiAnime[]>>('/api/anime')

      animeList.value = response.data.map(mapAnime)
      hasLoaded = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load your anime list.'

      throw err
    } finally {
      isLoading.value = false
      loadPromise = null
    }
  })()

  return loadPromise
}

function createAnimeFormData(data: AddAnimeData): FormData {
  const formData = new FormData()

  formData.append('title', data.title.trim())
  formData.append('description', data.description.trim())
  formData.append('episodes', String(data.episodes))
  formData.append('status', data.status)
  formData.append('is_favorite', String(data.isFavorite))
  formData.append('website_url', data.websiteUrl.trim())

  if (data.image) {
    formData.append('image', data.image)
  }

  return formData
}

async function addAnime(data: AddAnimeData): Promise<Anime> {
  error.value = null

  const formData = createAnimeFormData(data)

  const response = await apiFetch<ApiResponse<ApiAnime>>('/api/anime/create', {
    method: 'POST',
    body: formData,
  })

  const anime = mapAnime(response.data)

  animeList.value.unshift(anime)

  return anime
}

function createUpdateFormData(updates: UpdateAnimeData): FormData {
  const formData = new FormData()

  if (updates.title !== undefined) {
    formData.append('title', updates.title.trim())
  }

  if (updates.description !== undefined) {
    formData.append('description', updates.description.trim())
  }

  if (updates.episodes !== undefined) {
    formData.append('episodes', String(updates.episodes))
  }

  if (updates.status !== undefined) {
    formData.append('status', updates.status)
  }

  if (updates.isFavorite !== undefined) {
    formData.append('is_favorite', String(updates.isFavorite))
  }

  if (updates.websiteUrl !== undefined) {
    formData.append('website_url', updates.websiteUrl.trim())
  }

  if (updates.image) {
    formData.append('image', updates.image)
  }

  return formData
}

async function updateAnime(id: number, updates: UpdateAnimeData): Promise<Anime> {
  error.value = null

  const formData = createUpdateFormData(updates)

  const response = await apiFetch<ApiResponse<ApiAnime>>(`/api/anime/${id}`, {
    method: 'PUT',
    body: formData,
  })

  const anime = mapAnime(response.data)

  const index = animeList.value.findIndex((item) => item.id === id)

  if (index === -1) {
    animeList.value.unshift(anime)
  } else {
    animeList.value[index] = anime
  }

  return anime
}

async function updateAnimeProgress(id: number, progress: number): Promise<Anime | undefined> {
  error.value = null

  const response = await apiFetch<ApiResponse<ApiAnime>>(`/api/anime/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress }),
  })

  const anime = mapAnime(response.data)
  const index = animeList.value.findIndex((item) => item.id === id)

  if (index === -1) {
    animeList.value.unshift(anime)
  } else {
    animeList.value[index] = anime
  }

  return anime
}

async function deleteAnime(id: number): Promise<boolean> {
  error.value = null

  await apiFetch<ApiResponse<null>>(`/api/anime/${id}`, {
    method: 'DELETE',
  })

  const index = animeList.value.findIndex((item) => item.id === id)

  if (index !== -1) {
    animeList.value.splice(index, 1)
  }

  return true
}

export function useAnimeList() {
  if (!hasLoaded && !loadPromise) {
    void loadAnimeList().catch(() => {
      // The error is available through the shared error ref.
    })
  }

  return {
    animeList,
    isLoading,
    error,
    loadAnimeList,
    getAnimeById,
    addAnime,
    updateAnime,
    updateAnimeProgress,
    deleteAnime,
  }
}
