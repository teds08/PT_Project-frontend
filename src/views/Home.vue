<template>
  <AppLayout>
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-2 text-sm font-medium text-muted-foreground">Your collection</p>

          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">My Anime List Tracker (ALT)</h1>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep track of what you're watching, what you've completed, and what you want to watch
            next.
          </p>
        </div>

        <AddAnimeDialog :on-submit="handleAddAnime">
          <Button
            type="button"
            class="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2"
          >
            <Plus class="size-4" />
            Add Anime
          </Button>
        </AddAnimeDialog>
      </div>

      <!-- Highlights -->
      <section
        v-if="animeList.length > 0 && !isLoading"
        class="mb-10"
        aria-label="Anime highlights"
        @mouseenter="stopHighlightAutoplay"
        @mouseleave="startHighlightAutoplay"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Highlights</p>

            <h2 class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              From your collection
            </h2>
          </div>

          <div class="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous highlight"
              class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="animeList.length <= 1"
              @click="previousHighlight"
            >
              <ChevronLeft class="size-4" />
            </button>

            <button
              type="button"
              aria-label="Next highlight"
              class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="animeList.length <= 1"
              @click="nextHighlight"
            >
              <ChevronRight class="size-4" />
            </button>
          </div>
        </div>

        <div v-if="currentHighlight" class="relative overflow-hidden rounded-2xl bg-card shadow-sm">
          <!-- Background artwork -->
          <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              :src="currentHighlight.imageUrl"
              :alt="currentHighlight.title"
              aria-hidden="true"
              class="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
            />

            <div class="absolute inset-0 bg-background/94" />
          </div>

          <Transition name="highlight-fade" mode="out-in">
            <div
              :key="currentHighlight.id"
              class="relative grid min-h-[330px] gap-6 p-5 sm:min-h-[360px] sm:p-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-center lg:gap-8 lg:p-8"
            >
              <!-- Poster -->
              <div class="mx-auto w-full max-w-[160px] sm:max-w-[180px] lg:mx-0">
                <div class="overflow-hidden rounded-xl bg-muted shadow-lg shadow-black/10">
                  <div class="aspect-2/3">
                    <img
                      :src="currentHighlight.imageUrl"
                      :alt="currentHighlight.title"
                      class="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <!-- Highlight content -->
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    :class="highlightStatusClass"
                  >
                    {{ currentHighlight.status }}
                  </span>

                  <span
                    v-if="currentHighlight.isFavorite"
                    class="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600"
                  >
                    <Heart class="size-3 fill-current" />
                    Favorite
                  </span>
                </div>

                <h3
                  class="mt-4 line-clamp-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
                  :title="currentHighlight.title"
                >
                  {{ currentHighlight.title }}
                </h3>

                <p
                  v-if="currentHighlight.description"
                  class="mt-3 line-clamp-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base"
                >
                  {{ currentHighlight.description }}
                </p>

                <div class="mt-5 max-w-md space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-muted-foreground">Progress</span>

                    <span class="font-semibold text-foreground">
                      {{ currentHighlight.progress }} / {{ currentHighlight.episodes }}
                    </span>
                  </div>

                  <div class="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      class="h-full rounded-full bg-primary transition-all duration-500"
                      :style="{ width: `${highlightProgressPercentage}%` }"
                    />
                  </div>
                </div>

                <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    class="h-10 w-full cursor-pointer items-center gap-2 sm:w-auto"
                    @click="openHighlight"
                  >
                    <Eye class="size-4" />
                    View Anime
                  </Button>

                  <div class="flex items-center justify-center gap-1.5 sm:justify-start">
                    <button
                      v-for="(anime, index) in animeList"
                      :key="anime.id"
                      type="button"
                      :aria-label="`Show ${anime.title}`"
                      :aria-current="index === highlightIndex ? 'true' : undefined"
                      class="h-2 cursor-pointer rounded-full transition-all"
                      :class="
                        index === highlightIndex
                          ? 'w-6 bg-foreground'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      "
                      @click="goToHighlight(index)"
                    />
                  </div>
                </div>
              </div>

              <!-- Mobile carousel controls -->
              <div class="flex justify-between sm:hidden">
                <button
                  type="button"
                  aria-label="Previous highlight"
                  class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="animeList.length <= 1"
                  @click="previousHighlight"
                >
                  <ChevronLeft class="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="Next highlight"
                  class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="animeList.length <= 1"
                  @click="nextHighlight"
                >
                  <ChevronRight class="size-4" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </section>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative">
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search your anime..."
            class="h-11 w-full sm:max-w-md"
            :disabled="isLoading"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-8 flex gap-1 overflow-x-auto border-b pb-1">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          class="shrink-0 cursor-pointer rounded-t-md px-3 py-2 text-sm font-medium transition-colors"
          :class="
            selectedFilter === filter
              ? 'border-b-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          "
          :disabled="isLoading"
          @click="selectedFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <div v-for="index in 6" :key="index" class="overflow-hidden rounded-xl border bg-card">
          <div class="aspect-2/3 animate-pulse bg-muted" />

          <div class="space-y-3 p-3.5">
            <div class="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div class="h-3 w-full animate-pulse rounded bg-muted" />
            <div class="h-1.5 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center"
      >
        <h2 class="font-semibold">Unable to load your anime list</h2>

        <p class="mt-2 text-sm text-muted-foreground">
          {{ error }}
        </p>

        <Button type="button" class="mt-5 cursor-pointer" @click="retryLoading"> Try Again </Button>
      </div>

      <!-- Anime grid -->
      <div
        v-else-if="filteredAnimeList.length > 0"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <AnimeCard v-for="anime in filteredAnimeList" :key="anime.id" :anime="anime" />
      </div>

      <!-- Empty state -->
      <div v-else class="rounded-xl border border-dashed p-10 text-center">
        <h2 class="font-semibold">
          {{
            selectedFilter === 'Favorites'
              ? 'No favorite anime'
              : selectedFilter === 'Dropped'
                ? 'No dropped anime'
                : 'No anime found'
          }}
        </h2>

        <p class="mt-2 text-sm text-muted-foreground">
          {{
            selectedFilter === 'Favorites'
              ? 'Favorite an anime to see it here.'
              : selectedFilter === 'Dropped'
                ? 'Anime marked as dropped will appear here.'
                : 'Try another search or add a new anime to your list.'
          }}
        </p>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Eye, Heart, Plus } from '@lucide/vue'

import AppLayout from '@/components/AppLayout.vue'
import AnimeCard from '@/components/AnimeCard.vue'
import AddAnimeDialog from '@/components/AddAnimeDialog.vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useAnimeList, type AddAnimeData } from '@/lib/useAnimeList'

const router = useRouter()

const { animeList, isLoading, error, loadAnimeList, addAnime } = useAnimeList()

const filters = ['All', 'Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped', 'Favorites']

const searchQuery = ref('')
const selectedFilter = ref('All')

const highlightIndex = ref(0)

let highlightInterval: ReturnType<typeof setInterval> | null = null

const currentHighlight = computed(() => {
  return animeList.value[highlightIndex.value]
})

const highlightProgressPercentage = computed(() => {
  if (!currentHighlight.value || currentHighlight.value.episodes <= 0) {
    return 0
  }

  return Math.min((currentHighlight.value.progress / currentHighlight.value.episodes) * 100, 100)
})

const highlightStatusClass = computed(() => {
  if (!currentHighlight.value) {
    return 'bg-background/90 text-foreground'
  }

  switch (currentHighlight.value.status) {
    case 'Watching':
      return 'bg-blue-500/90 text-white'

    case 'Completed':
      return 'bg-green-500/90 text-white'

    case 'Plan to Watch':
      return 'bg-background/90 text-foreground'

    case 'On Hold':
      return 'bg-yellow-500/90 text-white'

    case 'Dropped':
      return 'bg-red-500/90 text-white'

    default:
      return 'bg-background/90 text-foreground'
  }
})

const filteredAnimeList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return animeList.value.filter((anime) => {
    const matchesSearch = query.length === 0 || anime.title.toLowerCase().includes(query)

    const matchesFilter =
      selectedFilter.value === 'All'
        ? true
        : selectedFilter.value === 'Favorites'
          ? anime.isFavorite
          : anime.status === selectedFilter.value

    return matchesSearch && matchesFilter
  })
})

const startHighlightAutoplay = () => {
  if (highlightInterval || animeList.value.length <= 1) {
    return
  }

  highlightInterval = setInterval(() => {
    nextHighlight()
  }, 5000)
}

const stopHighlightAutoplay = () => {
  if (!highlightInterval) {
    return
  }

  clearInterval(highlightInterval)
  highlightInterval = null
}

const nextHighlight = () => {
  if (animeList.value.length <= 1) {
    return
  }

  highlightIndex.value = (highlightIndex.value + 1) % animeList.value.length
}

const previousHighlight = () => {
  if (animeList.value.length <= 1) {
    return
  }

  highlightIndex.value =
    highlightIndex.value === 0 ? animeList.value.length - 1 : highlightIndex.value - 1
}

const goToHighlight = (index: number) => {
  if (index < 0 || index >= animeList.value.length) {
    return
  }

  highlightIndex.value = index

  stopHighlightAutoplay()
  startHighlightAutoplay()
}

const openHighlight = () => {
  if (!currentHighlight.value) {
    return
  }

  router.push(`/anime/${currentHighlight.value.id}`)
}

watch(
  () => animeList.value.length,
  (length) => {
    if (length === 0) {
      highlightIndex.value = 0
      stopHighlightAutoplay()
      return
    }

    if (highlightIndex.value >= length) {
      highlightIndex.value = 0
    }

    if (length > 1) {
      startHighlightAutoplay()
    }
  },
)

const handleAddAnime = async (data: AddAnimeData): Promise<void> => {
  await addAnime(data)
}

const retryLoading = async () => {
  try {
    await loadAnimeList(true)
  } catch {
    // The shared error ref is updated by useAnimeList.
  }
}

onMounted(() => {
  startHighlightAutoplay()
})

onUnmounted(() => {
  stopHighlightAutoplay()
})
</script>

<style scoped>
.highlight-fade-enter-active,
.highlight-fade-leave-active {
  transition:
    opacity 280ms ease,
    transform 280ms ease;
}

.highlight-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.highlight-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
