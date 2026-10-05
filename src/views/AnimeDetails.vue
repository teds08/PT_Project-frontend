<template>
  <AppLayout>
    <section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div v-if="anime" class="relative overflow-hidden rounded-2xl bg-background shadow-sm">
        <!-- Anime backdrop -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            :src="anime.imageUrl"
            :alt="anime.title"
            aria-hidden="true"
            class="absolute inset-0 h-full w-full scale-110 object-cover opacity-15 blur-2xl"
          />

          <div class="absolute inset-0 bg-background/92" />
        </div>

        <!-- Content -->
        <div class="relative">
          <!-- Back navigation -->
          <div class="px-5 pt-5 sm:px-7 sm:pt-7">
            <RouterLink
              to="/"
              class="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span class="text-base">←</span>
              Back to My List
            </RouterLink>
          </div>

          <!-- Main anime section -->
          <div
            class="grid gap-8 px-5 pb-7 pt-6 sm:px-7 sm:pb-9 sm:pt-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10"
          >
            <!-- Poster -->
            <div class="mx-auto w-full max-w-[280px]">
              <div
                class="group overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/10"
              >
                <div class="aspect-2/3 overflow-hidden bg-muted">
                  <img
                    :src="anime.imageUrl"
                    :alt="anime.title"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="min-w-0">
              <div class="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
                <AnimeOverview :anime="anime" />

                <!-- Status -->
                <div class="mt-7 border-t pt-6">
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label
                        for="anime-status"
                        class="text-sm font-semibold tracking-tight text-foreground"
                      >
                        Anime Status
                      </label>

                      <p class="mt-1 text-xs text-muted-foreground">
                        Update the current status without opening Edit Anime.
                      </p>
                    </div>

                    <span v-if="isUpdatingStatus" class="text-xs font-medium text-teal-600">
                      Updating status...
                    </span>
                  </div>

                  <div class="mt-4">
                    <Select
                      :model-value="selectedStatus"
                      :disabled="isUpdatingStatus"
                      @update:model-value="handleStatusChange"
                    >
                      <SelectTrigger
                        id="anime-status"
                        class="h-11 w-full cursor-pointer bg-background sm:max-w-sm"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Watching" class="cursor-pointer"> Watching </SelectItem>

                        <SelectItem value="Completed" class="cursor-pointer">
                          Completed
                        </SelectItem>

                        <SelectItem value="Plan to Watch" class="cursor-pointer">
                          Plan to Watch
                        </SelectItem>

                        <SelectItem value="On Hold" class="cursor-pointer"> On Hold </SelectItem>

                        <SelectItem value="Dropped" class="cursor-pointer"> Dropped </SelectItem>
                      </SelectContent>
                    </Select>

                    <p v-if="statusErrorMessage" role="alert" class="mt-2 text-sm text-destructive">
                      {{ statusErrorMessage }}
                    </p>
                  </div>
                </div>

                <!-- Progress -->
                <div class="mt-7 border-t pt-6">
                  <AnimeProgressTracker
                    :anime="anime"
                    :is-saving="isUpdatingProgress"
                    :error-message="progressErrorMessage"
                    @save="updateProgress"
                  />
                </div>

                <!-- Watch -->
                <div class="mt-7 border-t pt-6">
                  <AnimeWatchButton :website-url="anime.websiteUrl" />
                </div>

                <!-- Actions -->
                <div class="mt-7 border-t pt-6">
                  <div
                    v-if="favoriteErrorMessage"
                    role="alert"
                    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {{ favoriteErrorMessage }}
                  </div>

                  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      :variant="anime.isFavorite ? 'default' : 'outline'"
                      class="h-11 w-full cursor-pointer sm:w-auto"
                      :disabled="isUpdatingFavorite"
                      @click="toggleFavorite"
                    >
                      {{
                        isUpdatingFavorite
                          ? 'Updating...'
                          : anime.isFavorite
                            ? '♥ Favorited'
                            : '♡ Add to Favorites'
                      }}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      class="h-11 w-full cursor-pointer sm:w-auto"
                      @click="openEditDialog"
                    >
                      Edit Anime
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      class="h-11 w-full cursor-pointer sm:w-auto"
                      @click="openDeleteDialog"
                    >
                      Delete Anime
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Anime not found -->
      <div v-else class="rounded-2xl bg-card p-10 text-center shadow-sm sm:p-14">
        <h1 class="text-xl font-semibold">Anime not found</h1>

        <p class="mt-2 text-sm text-muted-foreground">
          This anime may have been removed from your list.
        </p>

        <Button type="button" class="mt-5 cursor-pointer" @click="goBackToList">
          Back to My List
        </Button>
      </div>
    </section>

    <AnimeEditDialog
      v-if="anime"
      v-model:open="isEditDialogOpen"
      :anime="anime"
      :is-saving="isSavingEdit"
      :error-message="editErrorMessage"
      @save="saveAnimeChanges"
    />

    <AnimeDeleteDialog
      v-if="anime"
      v-model:open="isDeleteDialogOpen"
      :anime="anime"
      :is-deleting="isDeleting"
      :error-message="deleteErrorMessage"
      @confirm="deleteAnime"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AcceptableValue } from 'reka-ui'
import { useRoute, useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import AnimeDeleteDialog from '@/components/anime/AnimeDeleteDialog.vue'
import AnimeEditDialog from '@/components/anime/AnimeEditDialog.vue'
import AnimeOverview from '@/components/anime/AnimeOverview.vue'
import AnimeProgressTracker from '@/components/anime/AnimeProgressTracker.vue'
import AnimeWatchButton from '@/components/anime/AnimeWatchButton.vue'

import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAnimeList, type AnimeStatus, type UpdateAnimeData } from '@/lib/useAnimeList'

const route = useRoute()
const router = useRouter()

const {
  getAnimeById,
  updateAnime,
  updateAnimeProgress,
  updateAnimeFavorite,
  updateAnimeStatus,
  deleteAnime: removeAnime,
} = useAnimeList()

const anime = computed(() => {
  const id = Number(route.params.id)

  return getAnimeById(id)
})

const selectedStatus = ref<AnimeStatus>('Plan to Watch')

const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)

const isSavingEdit = ref(false)
const isDeleting = ref(false)
const isUpdatingProgress = ref(false)
const isUpdatingFavorite = ref(false)
const isUpdatingStatus = ref(false)

const editErrorMessage = ref('')
const deleteErrorMessage = ref('')
const progressErrorMessage = ref('')
const favoriteErrorMessage = ref('')
const statusErrorMessage = ref('')

watch(
  () => anime.value?.status,
  (status) => {
    if (status) {
      selectedStatus.value = status
    }
  },
  { immediate: true },
)

const handleStatusChange = async (value: AcceptableValue) => {
  if (!anime.value || isUpdatingStatus.value) {
    return
  }

  if (typeof value !== 'string') {
    return
  }

  const validStatuses: AnimeStatus[] = [
    'Watching',
    'Completed',
    'Plan to Watch',
    'On Hold',
    'Dropped',
  ]

  if (!validStatuses.includes(value as AnimeStatus)) {
    return
  }

  const newStatus = value as AnimeStatus

  if (newStatus === anime.value.status) {
    return
  }

  const previousStatus = anime.value.status

  selectedStatus.value = newStatus
  isUpdatingStatus.value = true
  statusErrorMessage.value = ''

  try {
    await updateAnimeStatus(anime.value.id, newStatus)
  } catch (err) {
    selectedStatus.value = previousStatus

    statusErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to update anime status. Please try again.'
  } finally {
    isUpdatingStatus.value = false
  }
}

const updateProgress = async (progress: number) => {
  if (!anime.value || isUpdatingProgress.value) {
    return
  }

  const animeId = anime.value.id

  if (progress < 0 || progress > anime.value.episodes) {
    return
  }

  isUpdatingProgress.value = true
  progressErrorMessage.value = ''

  try {
    const updatedAnime = await updateAnimeProgress(animeId, progress)

    if (!updatedAnime) {
      throw new Error('Progress could not be updated. Please try again.')
    }
  } catch (err) {
    progressErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to update progress. Please try again.'
  } finally {
    isUpdatingProgress.value = false
  }
}

const toggleFavorite = async () => {
  if (!anime.value || isUpdatingFavorite.value) {
    return
  }

  isUpdatingFavorite.value = true
  favoriteErrorMessage.value = ''

  try {
    await updateAnimeFavorite(anime.value.id, !anime.value.isFavorite)
  } catch (err) {
    favoriteErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to update favorite status. Please try again.'
  } finally {
    isUpdatingFavorite.value = false
  }
}

const openEditDialog = () => {
  if (!anime.value || isSavingEdit.value) {
    return
  }

  editErrorMessage.value = ''
  isEditDialogOpen.value = true
}

const saveAnimeChanges = async (updates: UpdateAnimeData) => {
  if (!anime.value || isSavingEdit.value) {
    return
  }

  isSavingEdit.value = true
  editErrorMessage.value = ''

  try {
    await updateAnime(anime.value.id, updates)

    isEditDialogOpen.value = false
  } catch (err) {
    editErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to update anime. Please try again.'
  } finally {
    isSavingEdit.value = false
  }
}

const openDeleteDialog = () => {
  if (!anime.value || isDeleting.value) {
    return
  }

  deleteErrorMessage.value = ''
  isDeleteDialogOpen.value = true
}

const deleteAnime = async () => {
  if (!anime.value || isDeleting.value) {
    return
  }

  isDeleting.value = true
  deleteErrorMessage.value = ''

  try {
    const deleted = await removeAnime(anime.value.id)

    if (!deleted) {
      throw new Error('The anime could not be deleted. Please try again.')
    }

    isDeleteDialogOpen.value = false

    await router.push('/')
  } catch (err) {
    deleteErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to delete anime. Please try again.'
  } finally {
    isDeleting.value = false
  }
}

const goBackToList = () => {
  router.push('/')
}
</script>
