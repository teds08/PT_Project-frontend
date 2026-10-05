<template>
  <div class="mb-8 max-w-xl rounded-xl border bg-card p-5">
    <div class="mb-5">
      <h2 class="font-semibold">Update Progress</h2>

      <p class="mt-1 text-sm text-muted-foreground">
        Select the latest episode you've watched. You can move your progress forward or backward if
        you selected the wrong episode.
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
        :disabled="isSaving"
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
        :disabled="currentEpisodePage === 0 || isSaving"
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
        :disabled="!hasNextEpisodePage || isSaving"
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

        <span v-if="selectedEpisode === anime.episodes" class="text-xs font-medium text-green-600">
          Final episode
        </span>
      </div>

      <Button
        type="button"
        class="w-full"
        :disabled="!hasProgressChanges || isSaving"
        @click="saveProgress"
      >
        {{ isSaving ? 'Saving Progress...' : 'Save Progress' }}
      </Button>
    </div>

    <p v-if="errorMessage" role="alert" class="mt-3 text-sm text-destructive">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'

import type { Anime } from '@/lib/useAnimeList'

const EPISODES_PER_PAGE = 12

const props = defineProps<{
  anime: Anime
  isSaving: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  save: [progress: number]
}>()

const selectedProgress = ref(String(props.anime.progress))
const currentEpisodePage = ref(0)

const selectedEpisode = computed(() => {
  const episode = Number(selectedProgress.value)

  if (!Number.isInteger(episode) || !Number.isFinite(episode)) {
    return props.anime.progress
  }

  return Math.min(Math.max(episode, 0), props.anime.episodes)
})

const hasProgressChanges = computed(() => {
  return selectedEpisode.value !== props.anime.progress
})

const totalEpisodePages = computed(() => {
  if (props.anime.episodes <= 0) {
    return 0
  }

  return Math.ceil(props.anime.episodes / EPISODES_PER_PAGE)
})

const visibleEpisodes = computed(() => {
  const start = currentEpisodePage.value * EPISODES_PER_PAGE + 1
  const end = Math.min(start + EPISODES_PER_PAGE - 1, props.anime.episodes)

  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
})

const hasNextEpisodePage = computed(() => {
  return currentEpisodePage.value < totalEpisodePages.value - 1
})

const episodePageLabel = computed(() => {
  if (props.anime.episodes <= 0) {
    return 'No episodes'
  }

  const start = currentEpisodePage.value * EPISODES_PER_PAGE + 1
  const end = Math.min(start + EPISODES_PER_PAGE - 1, props.anime.episodes)

  return `${start}–${end} of ${props.anime.episodes}`
})

const getEpisodeButtonClass = (episode: number) => {
  if (episode === selectedEpisode.value) {
    return 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700'
  }

  if (episode <= props.anime.progress) {
    return 'border-green-200 bg-green-50 text-green-800 hover:border-green-500 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-900/50'
  }

  return 'border-border bg-muted/40 text-foreground hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30'
}

const selectEpisode = (episode: number) => {
  if (props.isSaving || episode < 1 || episode > props.anime.episodes) {
    return
  }

  selectedProgress.value = String(episode)
}

const previousEpisodePage = () => {
  if (currentEpisodePage.value > 0 && !props.isSaving) {
    currentEpisodePage.value -= 1
  }
}

const nextEpisodePage = () => {
  if (hasNextEpisodePage.value && !props.isSaving) {
    currentEpisodePage.value += 1
  }
}

const saveProgress = () => {
  if (props.isSaving || !hasProgressChanges.value) {
    return
  }

  const progress = selectedEpisode.value

  if (progress < 0 || progress > props.anime.episodes) {
    return
  }

  emit('save', progress)
}

watch(
  () => [props.anime.id, props.anime.progress, props.anime.episodes] as const,
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
</script>
