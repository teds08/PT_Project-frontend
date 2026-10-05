<template>
  <section class="mt-8 rounded-xl border bg-card p-5 shadow-sm">
    <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold">Episode Progress</h2>
        <p class="text-sm text-muted-foreground">Select the latest episode you have watched.</p>
      </div>

      <div class="text-sm text-muted-foreground">
        {{ anime.progress }} / {{ anime.episodes }} episodes
      </div>
    </div>

    <div class="mb-6">
      <div class="mb-2 flex items-center justify-between text-sm">
        <span class="font-medium">Progress</span>
        <span class="text-muted-foreground">{{ progressPercentage }}%</span>
      </div>

      <div class="h-2 overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full bg-primary transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          :disabled="currentEpisodePage === 1 || isUpdatingProgress"
          @click="previousEpisodePage"
        >
          Previous
        </button>

        <span class="text-sm text-muted-foreground">
          {{ episodePageLabel }}
        </span>

        <button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          :disabled="!hasNextEpisodePage || isUpdatingProgress"
          @click="nextEpisodePage"
        >
          Next
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        <button
          v-for="episode in visibleEpisodes"
          :key="episode"
          type="button"
          class="flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
          :class="getEpisodeButtonClass(episode)"
          :disabled="isUpdatingProgress"
          @click="selectEpisode(episode)"
        >
          {{ episode }}
        </button>
      </div>

      <div
        v-if="hasProgressChanges"
        class="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-sm font-medium">Episode {{ selectedEpisode }} selected</p>

          <p class="text-xs text-muted-foreground">Save your progress to update your anime list.</p>
        </div>

        <button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          :disabled="isUpdatingProgress"
          @click="saveProgress"
        >
          <span v-if="isUpdatingProgress">Saving...</span>
          <span v-else>Save Progress</span>
        </button>
      </div>

      <p v-if="progressErrorMessage" class="text-sm text-destructive">
        {{ progressErrorMessage }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Anime } from '@/lib/useAnimeList'

interface Props {
  anime: Anime
  onUpdateProgress: (id: number, progress: number) => Promise<Anime | undefined>
}

const props = defineProps<Props>()

const EPISODES_PER_PAGE = 12

const selectedProgress = ref(props.anime.progress)
const currentEpisodePage = ref(
  Math.max(1, Math.ceil(Math.max(props.anime.progress, 1) / EPISODES_PER_PAGE)),
)
const selectedEpisode = ref(props.anime.progress)
const hasProgressChanges = ref(false)
const isUpdatingProgress = ref(false)
const progressErrorMessage = ref<string | null>(null)

const totalEpisodePages = computed(() => {
  if (props.anime.episodes <= 0) {
    return 1
  }

  return Math.ceil(props.anime.episodes / EPISODES_PER_PAGE)
})

const visibleEpisodes = computed(() => {
  const start = (currentEpisodePage.value - 1) * EPISODES_PER_PAGE + 1
  const end = Math.min(start + EPISODES_PER_PAGE - 1, props.anime.episodes)

  if (start > props.anime.episodes) {
    return []
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const hasNextEpisodePage = computed(() => {
  return currentEpisodePage.value < totalEpisodePages.value
})

const episodePageLabel = computed(() => {
  if (totalEpisodePages.value <= 1) {
    return 'All episodes'
  }

  return `Page ${currentEpisodePage.value} of ${totalEpisodePages.value}`
})

const remainingEpisodes = computed(() => {
  return Math.max(props.anime.episodes - props.anime.progress, 0)
})

const progressPercentage = computed(() => {
  if (props.anime.episodes <= 0) {
    return 0
  }

  return Math.round(Math.min((props.anime.progress / props.anime.episodes) * 100, 100))
})

const getEpisodeButtonClass = (episode: number) => {
  if (episode === selectedEpisode.value && hasProgressChanges.value) {
    return 'border-primary bg-primary text-primary-foreground'
  }

  if (episode <= props.anime.progress) {
    return 'border-primary/30 bg-primary/10 text-primary'
  }

  return 'bg-background hover:bg-muted'
}

const selectEpisode = (episode: number) => {
  if (episode === props.anime.progress) {
    selectedProgress.value = episode
    selectedEpisode.value = episode
    hasProgressChanges.value = false
    progressErrorMessage.value = null
    return
  }

  selectedProgress.value = episode
  selectedEpisode.value = episode
  hasProgressChanges.value = episode !== props.anime.progress
  progressErrorMessage.value = null
}

const previousEpisodePage = () => {
  if (currentEpisodePage.value <= 1) {
    return
  }

  currentEpisodePage.value -= 1
}

const nextEpisodePage = () => {
  if (!hasNextEpisodePage.value) {
    return
  }

  currentEpisodePage.value += 1
}

const saveProgress = async () => {
  if (!hasProgressChanges.value || isUpdatingProgress.value) {
    return
  }

  isUpdatingProgress.value = true
  progressErrorMessage.value = null

  try {
    await props.onUpdateProgress(props.anime.id, selectedProgress.value)

    hasProgressChanges.value = false
  } catch (error) {
    progressErrorMessage.value =
      error instanceof Error ? error.message : 'Failed to update episode progress.'
  } finally {
    isUpdatingProgress.value = false
  }
}

watch(
  () => [props.anime.id, props.anime.progress, props.anime.episodes],
  () => {
    const progress = Math.min(Math.max(props.anime.progress, 0), Math.max(props.anime.episodes, 0))

    selectedProgress.value = progress
    selectedEpisode.value = progress
    hasProgressChanges.value = false
    progressErrorMessage.value = null

    const page = Math.max(1, Math.ceil(Math.max(progress, 1) / EPISODES_PER_PAGE))

    currentEpisodePage.value = Math.min(page, totalEpisodePages.value)
  },
)
</script>
