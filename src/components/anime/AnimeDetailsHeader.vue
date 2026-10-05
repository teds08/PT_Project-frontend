<template>
  <div class="grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
    <div class="mx-auto w-full max-w-[260px] md:mx-0">
      <div class="aspect-2/3 overflow-hidden rounded-xl border bg-muted shadow-sm">
        <img :src="anime.imageUrl" :alt="anime.title" class="h-full w-full object-cover" />
      </div>
    </div>

    <div class="min-w-0">
      <div class="mb-6">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusClass">
            {{ anime.status }}
          </span>

          <span class="text-sm text-muted-foreground"> {{ anime.episodes }} episodes </span>

          <span v-if="anime.isFavorite" class="rounded-full border px-2.5 py-1 text-xs font-medium">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Anime } from '@/lib/useAnimeList'

const props = defineProps<{
  anime: Anime
}>()

const remainingEpisodes = computed(() => {
  return Math.max(props.anime.episodes - props.anime.progress, 0)
})

const progressPercentage = computed(() => {
  if (props.anime.episodes <= 0) {
    return 0
  }

  return Math.round(Math.min((props.anime.progress / props.anime.episodes) * 100, 100))
})

const statusClass = computed(() => {
  switch (props.anime.status) {
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
</script>
