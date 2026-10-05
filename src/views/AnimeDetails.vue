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
            <img :src="anime.image" :alt="anime.title" class="h-full w-full object-cover" />
          </div>
        </div>

        <div class="min-w-0">
          <div class="mb-6">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusClass">
                {{ anime.status }}
              </span>

              <span class="text-sm text-muted-foreground">
                {{ anime.year }}
              </span>

              <span
                v-if="anime.isFavorite"
                class="rounded-full border px-2.5 py-1 text-xs font-medium"
              >
                ♥ Favorite
              </span>
            </div>

            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {{ anime.title }}
            </h1>

            <p v-if="anime.description" class="mt-3 max-w-2xl leading-7 text-muted-foreground">
              {{ anime.description }}
            </p>

            <p v-else class="mt-3 max-w-2xl leading-7 text-muted-foreground">
              No description has been added for this anime.
            </p>
          </div>

          <div class="mb-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl border bg-card p-4">
              <p class="text-sm text-muted-foreground">Episodes</p>
              <p class="mt-1 text-2xl font-semibold">{{ anime.episodes }}</p>
            </div>

            <div class="rounded-xl border bg-card p-4">
              <p class="text-sm text-muted-foreground">Progress</p>

              <p class="mt-1 text-2xl font-semibold">
                {{ anime.progress }}

                <span class="text-base font-normal text-muted-foreground">
                  / {{ anime.episodes }}
                </span>
              </p>
            </div>

            <div class="rounded-xl border bg-card p-4">
              <p class="text-sm text-muted-foreground">Remaining</p>
              <p class="mt-1 text-2xl font-semibold">{{ remainingEpisodes }}</p>
            </div>
          </div>

          <div class="mb-8 max-w-xl">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-medium">Watching progress</span>
              <span class="text-muted-foreground">{{ progressPercentage }}%</span>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary transition-all duration-300"
                :style="{ width: `${progressPercentage}%` }"
              />
            </div>
          </div>

          <!-- Clickable Episode Selector -->
          <div class="mb-8 max-w-xl rounded-xl border bg-card p-5">
            <div class="mb-5">
              <h2 class="font-semibold">Update Progress</h2>

              <p class="mt-1 text-sm text-muted-foreground">
                Select the latest episode you've watched. You can move your progress forward or
                backward if you selected the wrong episode.
              </p>
            </div>

            <div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="h-3 w-3 rounded bg-green-100 ring-1 ring-green-200" />
                <span class="text-muted-foreground">Watched</span>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="h-3 w-3 rounded bg-green-600" />
                <span class="text-muted-foreground">Selected</span>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="h-3 w-3 rounded border bg-muted" />
                <span class="text-muted-foreground">Unwatched</span>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
              <button
                v-for="episode in visibleEpisodes"
                :key="episode"
                type="button"
                :disabled="isUpdatingProgress"
                :aria-pressed="episode === selectedEpisode"
                :aria-label="`Episode ${episode}${episode === selectedEpisode ? ', selected' : episode <= anime.progress ? ', watched' : ', unwatched'}`"
                class="flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                :class="getEpisodeButtonClass(episode)"
                @click="selectEpisode(episode)"
              >
                {{ episode }}
              </button>
            </div>

            <div class="mt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="currentEpisodePage === 0 || isUpdatingProgress"
                @click="previousEpisodePage"
              >
                ← Previous
              </Button>

              <span class="text-center text-xs text-muted-foreground">
                {{ episodePageLabel }}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="!hasNextEpisodePage || isUpdatingProgress"
                @click="nextEpisodePage"
              >
                Next →
              </Button>
            </div>

            <div class="mt-5 border-t pt-4">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm text-muted-foreground">
                  <template v-if="selectedEpisode > anime.progress">
                    Progress will increase to episode
                    <span class="font-semibold text-foreground">{{ selectedEpisode }}</span
                    >.
                  </template>

                  <template v-else-if="selectedEpisode < anime.progress">
                    Progress will decrease to episode
                    <span class="font-semibold text-foreground">{{ selectedEpisode }}</span
                    >.
                  </template>

                  <template v-else> Progress is up to date. </template>
                </p>

                <span
                  v-if="selectedEpisode === anime.episodes"
                  class="text-xs font-medium text-green-600"
                >
                  Final episode
                </span>
              </div>

              <Button
                type="button"
                class="w-full"
                :disabled="!hasProgressChanges || isUpdatingProgress"
                @click="updateProgress"
              >
                {{ isUpdatingProgress ? 'Saving Progress...' : 'Save Progress' }}
              </Button>
            </div>

            <p v-if="progressErrorMessage" role="alert" class="mt-3 text-sm text-destructive">
              {{ progressErrorMessage }}
            </p>
          </div>

          <div v-if="anime.websiteUrl" class="mb-8">
            <a
              :href="anime.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>

              Watch it Now
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              class="w-full sm:w-auto"
              :disabled="!hasProgressChanges || isUpdatingProgress"
              @click="updateProgress"
            >
              {{ isUpdatingProgress ? 'Saving...' : 'Update Progress' }}
            </Button>

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

    <!-- Edit Anime Dialog -->
    <Dialog :open="isEditDialogOpen" @update:open="handleEditDialogOpenChange">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Anime</DialogTitle>
          <DialogDescription> Update the information for this anime. </DialogDescription>
        </DialogHeader>

        <div class="space-y-5 py-2">
          <div class="space-y-2">
            <Label for="edit-anime-title">Title</Label>

            <Input
              id="edit-anime-title"
              v-model="editForm.title"
              placeholder="Enter anime title"
              autocomplete="off"
              :disabled="isSavingEdit"
            />
          </div>

          <div class="space-y-2">
            <Label for="edit-anime-description">
              Description
              <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
            </Label>

            <Textarea
              id="edit-anime-description"
              v-model="editForm.description"
              placeholder="Add a short description..."
              class="min-h-24 resize-none"
              :disabled="isSavingEdit"
            />
          </div>

          <div class="space-y-2">
            <Label for="edit-anime-episodes">Episodes</Label>

            <Input
              id="edit-anime-episodes"
              v-model.number="editForm.episodes"
              type="number"
              min="1"
              placeholder="Enter total episodes"
              :disabled="isSavingEdit"
            />

            <p class="text-xs text-muted-foreground">
              Current progress: {{ anime?.progress }} episode{{ anime?.progress === 1 ? '' : 's' }}
              watched.
            </p>

            <p v-if="episodesValidationError" class="text-xs font-medium text-destructive">
              {{ episodesValidationError }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="edit-anime-status">Status</Label>

            <Select v-model="editForm.status" :disabled="isSavingEdit">
              <SelectTrigger id="edit-anime-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Watching">Watching</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Plan to Watch">Plan to Watch</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center justify-between rounded-lg border p-4">
            <div class="space-y-1">
              <Label for="edit-anime-favorite" class="cursor-pointer"> Favorite </Label>

              <p class="text-xs text-muted-foreground">Add this anime to your favorites.</p>
            </div>

            <Switch
              id="edit-anime-favorite"
              v-model:checked="editForm.isFavorite"
              class="cursor-pointer data-checked:bg-teal-600"
              :disabled="isSavingEdit"
            />
          </div>

          <div class="space-y-2">
            <Label for="edit-anime-website">
              Website
              <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
            </Label>

            <Input
              id="edit-anime-website"
              v-model="editForm.websiteUrl"
              type="url"
              placeholder="https://example.com"
              autocomplete="url"
              :disabled="isSavingEdit"
            />
          </div>

          <p v-if="editErrorMessage" role="alert" class="text-sm text-destructive">
            {{ editErrorMessage }}
          </p>
        </div>

        <DialogFooter class="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            class="w-full sm:w-auto"
            :disabled="isSavingEdit"
            @click="closeEditDialog"
          >
            Cancel
          </Button>

          <Button
            type="button"
            class="w-full sm:w-auto"
            :disabled="!isEditFormValid || isSavingEdit"
            @click="saveAnimeChanges"
          >
            {{ isSavingEdit ? 'Saving...' : 'Save Changes' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Anime Dialog -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="handleDeleteDialogOpenChange">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {{ anime?.title }}?</AlertDialogTitle>

          <AlertDialogDescription>
            This will remove this anime from your list. Your progress, favorite status, and other
            tracking information will also be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p v-if="deleteErrorMessage" role="alert" class="text-sm text-destructive">
          {{ deleteErrorMessage }}
        </p>

        <AlertDialogFooter class="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel
            class="w-full sm:w-auto"
            :disabled="isDeleting"
            @click="closeDeleteDialog"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            class="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            :disabled="isDeleting"
            @click.prevent="deleteAnime"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Anime' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useAnimeList, type AnimeStatus } from '@/lib/useAnimeList'

interface EditAnimeForm {
  title: string
  description: string
  episodes: number
  status: AnimeStatus
  isFavorite: boolean
  websiteUrl: string
}

const EPISODES_PER_PAGE = 12

const route = useRoute()
const router = useRouter()

const { getAnimeById, updateAnime, updateAnimeProgress, deleteAnime: removeAnime } = useAnimeList()

const anime = computed(() => {
  const id = Number(route.params.id)

  return getAnimeById(id)
})

const selectedProgress = ref(String(anime.value?.progress ?? 0))
const currentEpisodePage = ref(0)

const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)

const isSavingEdit = ref(false)
const isDeleting = ref(false)
const isUpdatingProgress = ref(false)

const editErrorMessage = ref('')
const deleteErrorMessage = ref('')
const progressErrorMessage = ref('')

const editForm = reactive<EditAnimeForm>({
  title: '',
  description: '',
  episodes: 0,
  status: 'Plan to Watch',
  isFavorite: false,
  websiteUrl: '',
})

const selectedEpisode = computed(() => {
  if (!anime.value) {
    return 0
  }

  const episode = Number(selectedProgress.value)

  if (!Number.isInteger(episode) || !Number.isFinite(episode)) {
    return anime.value.progress
  }

  return Math.min(Math.max(episode, 0), anime.value.episodes)
})

const hasProgressChanges = computed(() => {
  return !!anime.value && selectedEpisode.value !== anime.value.progress
})

const totalEpisodePages = computed(() => {
  if (!anime.value || anime.value.episodes <= 0) {
    return 0
  }

  return Math.ceil(anime.value.episodes / EPISODES_PER_PAGE)
})

const visibleEpisodes = computed(() => {
  if (!anime.value) {
    return []
  }

  const start = currentEpisodePage.value * EPISODES_PER_PAGE + 1
  const end = Math.min(start + EPISODES_PER_PAGE - 1, anime.value.episodes)

  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
})

const hasNextEpisodePage = computed(() => {
  return currentEpisodePage.value < totalEpisodePages.value - 1
})

const episodePageLabel = computed(() => {
  if (!anime.value || anime.value.episodes <= 0) {
    return 'No episodes'
  }

  const start = currentEpisodePage.value * EPISODES_PER_PAGE + 1
  const end = Math.min(start + EPISODES_PER_PAGE - 1, anime.value.episodes)

  return `${start}–${end} of ${anime.value.episodes}`
})

const remainingEpisodes = computed(() => {
  if (!anime.value) {
    return 0
  }

  return Math.max(anime.value.episodes - anime.value.progress, 0)
})

const progressPercentage = computed(() => {
  if (!anime.value || anime.value.episodes <= 0) {
    return 0
  }

  return Math.round(Math.min((anime.value.progress / anime.value.episodes) * 100, 100))
})

const statusClass = computed(() => {
  if (!anime.value) {
    return 'border bg-background text-foreground'
  }

  switch (anime.value.status) {
    case 'Watching':
      return 'bg-blue-500/90 text-white'

    case 'Completed':
      return 'bg-green-500/90 text-white'

    case 'Plan to Watch':
      return 'border bg-background text-foreground'

    case 'On Hold':
      return 'bg-yellow-500/90 text-white'

    case 'Dropped':
      return 'bg-red-500/90 text-white'

    default:
      return 'border bg-background text-foreground'
  }
})

const episodesValidationError = computed(() => {
  if (!anime.value) {
    return ''
  }

  if (!Number.isInteger(editForm.episodes) || editForm.episodes <= 0) {
    return 'Episodes must be a whole number greater than 0.'
  }

  if (editForm.episodes < anime.value.progress) {
    return `Episodes cannot be lower than your current progress of ${anime.value.progress}.`
  }

  return ''
})

const isEditFormValid = computed(() => {
  return (
    !!anime.value &&
    editForm.title.trim().length > 0 &&
    editForm.status.length > 0 &&
    !episodesValidationError.value
  )
})

const getEpisodeButtonClass = (episode: number) => {
  if (!anime.value) {
    return ''
  }

  // Selected episode takes precedence over watched/unwatched styling.
  if (episode === selectedEpisode.value) {
    return 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700'
  }

  if (episode <= anime.value.progress) {
    return 'border-green-200 bg-green-50 text-green-800 hover:border-green-500 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-900/50'
  }

  return 'border-border bg-muted/40 text-foreground hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30'
}

const selectEpisode = (episode: number) => {
  if (!anime.value || isUpdatingProgress.value || episode < 1 || episode > anime.value.episodes) {
    return
  }

  selectedProgress.value = String(episode)
  progressErrorMessage.value = ''
}

const previousEpisodePage = () => {
  if (currentEpisodePage.value > 0 && !isUpdatingProgress.value) {
    currentEpisodePage.value -= 1
  }
}

const nextEpisodePage = () => {
  if (hasNextEpisodePage.value && !isUpdatingProgress.value) {
    currentEpisodePage.value += 1
  }
}

// Keep the selection and episode page valid if the anime changes.
watch(
  () => [anime.value?.id, anime.value?.progress, anime.value?.episodes] as const,
  ([id, progress, episodes]) => {
    if (id === undefined) {
      selectedProgress.value = '0'
      currentEpisodePage.value = 0
      return
    }

    selectedProgress.value = String(progress ?? 0)

    const lastPage = Math.max(0, Math.ceil((episodes ?? 0) / EPISODES_PER_PAGE) - 1)

    currentEpisodePage.value = Math.min(currentEpisodePage.value, lastPage)
  },
  { immediate: true },
)

const openEditDialog = () => {
  if (!anime.value || isSavingEdit.value) {
    return
  }

  editForm.title = anime.value.title
  editForm.description = anime.value.description
  editForm.episodes = anime.value.episodes
  editForm.status = anime.value.status
  editForm.isFavorite = anime.value.isFavorite
  editForm.websiteUrl = anime.value.websiteUrl

  editErrorMessage.value = ''
  isEditDialogOpen.value = true
}

const handleEditDialogOpenChange = (open: boolean) => {
  if (isSavingEdit.value && !open) {
    return
  }

  isEditDialogOpen.value = open

  if (open) {
    editErrorMessage.value = ''
  }
}

const closeEditDialog = () => {
  if (isSavingEdit.value) {
    return
  }

  isEditDialogOpen.value = false
  editErrorMessage.value = ''
}

const saveAnimeChanges = async () => {
  if (!anime.value || !isEditFormValid.value || isSavingEdit.value) {
    return
  }

  isSavingEdit.value = true
  editErrorMessage.value = ''

  try {
    const updatedAnime = await updateAnime(anime.value.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      episodes: editForm.episodes,
      status: editForm.status,
      isFavorite: editForm.isFavorite,
      websiteUrl: editForm.websiteUrl.trim(),
    })

    if (!updatedAnime) {
      throw new Error('The anime could not be found or updated. Please try again.')
    }

    selectedProgress.value = String(updatedAnime.progress)
    isEditDialogOpen.value = false
  } catch (err) {
    editErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to update anime. Please try again.'
  } finally {
    isSavingEdit.value = false
  }
}

const updateProgress = async () => {
  if (!anime.value || isUpdatingProgress.value || !hasProgressChanges.value) {
    return
  }

  const animeId = anime.value.id
  const progressToSave = selectedEpisode.value

  if (progressToSave < 0 || progressToSave > anime.value.episodes) {
    return
  }

  isUpdatingProgress.value = true
  progressErrorMessage.value = ''

  try {
    const updatedAnime = await updateAnimeProgress(animeId, progressToSave)

    if (!updatedAnime) {
      throw new Error('Progress could not be updated. Please try again.')
    }

    selectedProgress.value = String(updatedAnime.progress)

    // Show the page containing the saved progress.
    currentEpisodePage.value = Math.min(
      Math.floor(Math.max(updatedAnime.progress - 1, 0) / EPISODES_PER_PAGE),
      Math.max(totalEpisodePages.value - 1, 0),
    )
  } catch (err) {
    progressErrorMessage.value =
      err instanceof Error ? err.message : 'Failed to update progress. Please try again.'
  } finally {
    isUpdatingProgress.value = false
  }
}

const openDeleteDialog = () => {
  if (!anime.value || isDeleting.value) {
    return
  }

  deleteErrorMessage.value = ''
  isDeleteDialogOpen.value = true
}

const handleDeleteDialogOpenChange = (open: boolean) => {
  if (isDeleting.value && !open) {
    return
  }

  isDeleteDialogOpen.value = open

  if (open) {
    deleteErrorMessage.value = ''
  }
}

const closeDeleteDialog = () => {
  if (isDeleting.value) {
    return
  }

  isDeleteDialogOpen.value = false
  deleteErrorMessage.value = ''
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
