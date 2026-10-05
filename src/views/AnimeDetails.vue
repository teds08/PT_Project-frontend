<template>
  <AppLayout>
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <RouterLink
        to="/"
        class="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to My List
      </RouterLink>

      <div v-if="anime" class="grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
        <div class="mx-auto w-full max-w-[260px] md:mx-0">
          <div class="aspect-2/3 overflow-hidden rounded-xl border bg-muted shadow-sm">
            <img :src="anime.imageUrl" :alt="anime.title" class="h-full w-full object-cover" />
          </div>
        </div>

        <div class="min-w-0">
          <AnimeOverview :anime="anime" />

          <AnimeProgressTracker
            :anime="anime"
            :is-saving="isUpdatingProgress"
            :error-message="progressErrorMessage"
            @save="updateProgress"
          />

          <AnimeWatchButton :website-url="anime.websiteUrl" />

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              class="w-full sm:w-auto"
              @click="openEditDialog"
            >
              Edit Anime
            </Button>

            <Button
              type="button"
              variant="destructive"
              class="w-full sm:w-auto"
              @click="openDeleteDialog"
            >
              Delete Anime
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="rounded-xl border border-dashed p-10 text-center">
        <h1 class="text-xl font-semibold">Anime not found</h1>

        <p class="mt-2 text-sm text-muted-foreground">
          This anime may have been removed from your list.
        </p>

        <Button type="button" class="mt-5" @click="goBackToList"> Back to My List </Button>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import AnimeDeleteDialog from '@/components/anime/AnimeDeleteDialog.vue'
import AnimeEditDialog from '@/components/anime/AnimeEditDialog.vue'
import AnimeOverview from '@/components/anime/AnimeOverview.vue'
import AnimeProgressTracker from '@/components/anime/AnimeProgressTracker.vue'
import AnimeWatchButton from '@/components/anime/AnimeWatchButton.vue'

import { Button } from '@/components/ui/button'

import { useAnimeList, type UpdateAnimeData } from '@/lib/useAnimeList'

const route = useRoute()
const router = useRouter()

const { getAnimeById, updateAnime, updateAnimeProgress, deleteAnime: removeAnime } = useAnimeList()

const anime = computed(() => {
  const id = Number(route.params.id)

  return getAnimeById(id)
})

const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)

const isSavingEdit = ref(false)
const isDeleting = ref(false)
const isUpdatingProgress = ref(false)

const editErrorMessage = ref('')
const deleteErrorMessage = ref('')
const progressErrorMessage = ref('')

const openProgressTracker = () => {
  const progressTracker = document.querySelector('#anime-progress-tracker')

  if (progressTracker) {
    progressTracker.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
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
