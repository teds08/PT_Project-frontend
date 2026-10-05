<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>

    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add Anime</DialogTitle>

        <DialogDescription>
          Add an anime to your personal list and start tracking your progress.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <div class="space-y-2">
          <Label for="anime-title">Title</Label>

          <Input
            id="anime-title"
            v-model="form.title"
            placeholder="Enter anime title"
            autocomplete="off"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="anime-description">
            Description
            <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
          </Label>

          <Textarea
            id="anime-description"
            v-model="form.description"
            placeholder="Add a short description..."
            class="min-h-24 resize-none"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="anime-episodes">Episodes</Label>

          <Input
            id="anime-episodes"
            v-model.number="form.episodes"
            type="number"
            min="1"
            placeholder="Enter total episodes"
            :disabled="isSubmitting"
          />

          <p class="text-xs text-muted-foreground">
            This determines the maximum episode you can mark as watched.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="anime-status">Status</Label>

          <Select v-model="form.status" :disabled="isSubmitting">
            <SelectTrigger id="anime-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Watching">Watching</SelectItem>
              <SelectItem value="Plan to Watch">Plan to Watch</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center justify-between rounded-lg border p-4">
          <div class="space-y-1">
            <Label for="anime-favorite" class="cursor-pointer"> Favorite </Label>

            <p class="text-xs text-muted-foreground">Add this anime to your favorites.</p>
          </div>

          <Switch
            id="anime-favorite"
            v-model:checked="form.isFavorite"
            class="cursor-pointer data-checked:bg-teal-600"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="anime-website">
            Website
            <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
          </Label>

          <Input
            id="anime-website"
            v-model="form.websiteUrl"
            type="url"
            placeholder="https://example.com"
            autocomplete="url"
            :disabled="isSubmitting"
          />
        </div>

        <p v-if="errorMessage" role="alert" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" :disabled="isSubmitting" @click="closeDialog">
          Cancel
        </Button>

        <Button type="button" :disabled="!isFormValid || isSubmitting" @click="addAnime">
          {{ isSubmitting ? 'Adding...' : 'Add Anime' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Switch } from '@/components/ui/switch'

import type { AnimeStatus } from '@/lib/useAnimeList'

interface AddAnimeData {
  title: string
  description: string
  episodes: number
  status: AnimeStatus
  isFavorite: boolean
  websiteUrl: string
}

const props = defineProps<{
  onSubmit: (anime: AddAnimeData) => Promise<void>
}>()

const isOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive<AddAnimeData>({
  title: '',
  description: '',
  episodes: 0,
  status: 'Plan to Watch',
  isFavorite: false,
  websiteUrl: '',
})

const isFormValid = computed(() => {
  const website = form.websiteUrl.trim()

  const validWebsite =
    website.length === 0 ||
    (() => {
      try {
        const url = new URL(website)

        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    })()

  return (
    form.title.trim().length > 0 &&
    Number.isInteger(form.episodes) &&
    form.episodes > 0 &&
    form.status.length > 0 &&
    validWebsite
  )
})

watch(isOpen, (open) => {
  if (open) {
    errorMessage.value = ''
  }
})

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.episodes = 0
  form.status = 'Plan to Watch'
  form.isFavorite = false
  form.websiteUrl = ''
  errorMessage.value = ''
}

const closeDialog = () => {
  if (isSubmitting.value) {
    return
  }

  isOpen.value = false
  resetForm()
}

const addAnime = async () => {
  if (!isFormValid.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await props.onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      episodes: form.episodes,
      status: form.status,
      isFavorite: form.isFavorite,
      websiteUrl: form.websiteUrl.trim(),
    })

    // Close and reset only after successful creation.
    isOpen.value = false
    resetForm()
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Failed to add anime. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
