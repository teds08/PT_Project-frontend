<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    @click="openDetails"
  >
    <div class="relative aspect-2/3 overflow-hidden bg-muted">
      <img
        :src="anime.image"
        :alt="anime.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent" />

      <div
        class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm"
        :class="statusClass"
      >
        {{ anime.status }}
      </div>

      <div class="absolute bottom-3 left-3 right-3 text-xs font-medium text-white">
        {{ anime.year }}
      </div>
    </div>

    <div class="space-y-3 p-3.5">
      <div>
        <h3 class="truncate text-sm font-semibold leading-5" :title="anime.title">
          {{ anime.title }}
        </h3>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Progress</span>

          <span class="font-medium"> {{ anime.progress }} / {{ anime.episodes }} </span>
        </div>

        <div class="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all duration-500"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Anime {
  id: number
  title: string
  image: string
  year: number
  status: string
  progress: number
  episodes: number
}

const props = defineProps<{
  anime: Anime
}>()

const router = useRouter()

const progressPercentage = computed(() => {
  if (props.anime.episodes <= 0) {
    return 0
  }

  return Math.min((props.anime.progress / props.anime.episodes) * 100, 100)
})

const statusClass = computed(() => {
  switch (props.anime.status) {
    case 'Watching':
      return 'bg-blue-500/90 text-white'

    case 'Completed':
      return 'bg-green-500/90 text-white'

    case 'Plan to Watch':
      return 'bg-background/90 text-foreground backdrop-blur'

    case 'On Hold':
      return 'bg-yellow-500/90 text-white'

    case 'Dropped':
      return 'bg-red-500/90 text-white'

    default:
      return 'bg-background/90 text-foreground backdrop-blur'
  }
})

const openDetails = () => {
  router.push(`/anime/${props.anime.id}`)
}
</script>
