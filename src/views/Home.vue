<template>
  <AppLayout>
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-2 text-sm font-medium text-muted-foreground">Your collection</p>

          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">My Anime List</h1>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep track of what you're watching, what you've completed, and what you want to watch
            next.
          </p>
        </div>

        <AddAnimeDialog :on-submit="handleAddAnime">
          <Button type="button" class="inline-flex h-10 shrink-0 items-center justify-center">
            + Add Anime
          </Button>
        </AddAnimeDialog>
      </div>

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

      <div class="mb-8 flex gap-1 overflow-x-auto border-b pb-1">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          class="shrink-0 rounded-t-md px-3 py-2 text-sm font-medium transition-colors"
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

      <div
        v-else-if="error"
        class="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center"
      >
        <h2 class="font-semibold">Unable to load your anime list</h2>

        <p class="mt-2 text-sm text-muted-foreground">
          {{ error }}
        </p>

        <Button type="button" class="mt-5" @click="retryLoading"> Try Again </Button>
      </div>

      <div
        v-else-if="filteredAnimeList.length > 0"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <AnimeCard v-for="anime in filteredAnimeList" :key="anime.id" :anime="anime" />
      </div>

      <div v-else class="rounded-xl border border-dashed p-10 text-center">
        <h2 class="font-semibold">No anime found</h2>

        <p class="mt-2 text-sm text-muted-foreground">
          Try another search or add a new anime to your list.
        </p>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import AppLayout from '@/components/AppLayout.vue'
import AnimeCard from '@/components/AnimeCard.vue'
import AddAnimeDialog from '@/components/AddAnimeDialog.vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useAnimeList, type AddAnimeData } from '@/lib/useAnimeList'

const { animeList, isLoading, error, loadAnimeList, addAnime } = useAnimeList()

const filters = ['All', 'Watching', 'Completed', 'Plan to Watch', 'On Hold']

const searchQuery = ref('')
const selectedFilter = ref('All')

const filteredAnimeList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return animeList.value.filter((anime) => {
    const matchesSearch = query.length === 0 || anime.title.toLowerCase().includes(query)

    const matchesFilter = selectedFilter.value === 'All' || anime.status === selectedFilter.value

    return matchesSearch && matchesFilter
  })
})

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
</script>
