import { ref } from 'vue'
import { apiFetch } from './api'

export type AnimeStatus = 'Watching' | 'Completed' | 'Plan to Watch' | 'On Hold' | 'Dropped'

export interface Anime {
  id: number
  title: string
  description: string
  image: string
  year: number
  status: AnimeStatus
  progress: number
  episodes: number
  isFavorite: boolean
  websiteUrl: string
}

export interface AddAnimeData {
  title: string
  description: string
  episodes: number
  status: AnimeStatus
  isFavorite: boolean
  websiteUrl: string
}

export interface UpdateAnimeData {
  title?: string
  description?: string
  episodes?: number
  status?: AnimeStatus
  isFavorite?: boolean
  websiteUrl?: string
}

interface ApiAnime {
  id: number
  user_id: number
  title: string
  description: string | null
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
  // Preserve frontend-only fields if this anime is already loaded.
  const existingAnime = animeList.value.find((item) => item.id === anime.id)

  return {
    id: anime.id,
    title: anime.title,
    description: anime.description ?? '',
    image: existingAnime?.image ?? FALLBACK_IMAGE,
    year: existingAnime?.year ?? new Date().getFullYear(),
    status: anime.status,
    progress: anime.progress,
    episodes: anime.episodes,
    isFavorite: anime.is_favorite,
    websiteUrl: anime.website_url ?? '',
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
      const response = await apiFetch<ApiResponse<ApiAnime[]>>('/anime/getall')

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

async function addAnime(data: AddAnimeData): Promise<Anime> {
  error.value = null

  const response = await apiFetch<ApiResponse<ApiAnime>>('/anime/create', {
    method: 'POST',
    body: JSON.stringify({
      title: data.title.trim(),
      description: data.description,
      episodes: data.episodes,
      status: data.status,
      is_favorite: data.isFavorite,
      website_url: data.websiteUrl.trim() || null,
    }),
  })

  const anime = mapAnime(response.data)

  animeList.value.unshift(anime)

  return anime
}

async function updateAnime(id: number, updates: UpdateAnimeData): Promise<Anime | undefined> {
  error.value = null

  const payload: Record<string, unknown> = {}

  if (updates.title !== undefined) {
    payload.title = updates.title
  }

  if (updates.description !== undefined) {
    payload.description = updates.description
  }

  if (updates.episodes !== undefined) {
    payload.episodes = updates.episodes
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.isFavorite !== undefined) {
    payload.is_favorite = updates.isFavorite
  }

  if (updates.websiteUrl !== undefined) {
    payload.website_url = updates.websiteUrl.trim() || null
  }

  const response = await apiFetch<ApiResponse<ApiAnime>>(`/anime/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
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

  const response = await apiFetch<ApiResponse<ApiAnime>>(`/anime/update/${id}/progress`, {
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

  await apiFetch<ApiResponse<null>>(`/anime/delete/${id}`, {
    method: 'DELETE',
  })

  const index = animeList.value.findIndex((item) => item.id === id)

  if (index !== -1) {
    animeList.value.splice(index, 1)
  }

  return true
}

export function useAnimeList() {
  // Start loading the list only once for the shared module state.
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
