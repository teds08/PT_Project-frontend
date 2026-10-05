<template>
  <Dialog :open="isOpen" @update:open="handleDialogOpenChange">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Anime</DialogTitle>

        <DialogDescription>
          Update the information for this anime. Leave the image unchanged if you do not want to
          replace it.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <div class="space-y-2">
          <Label for="edit-anime-title">Title</Label>

          <Input
            id="edit-anime-title"
            v-model="form.title"
            placeholder="Enter anime title"
            autocomplete="off"
            :disabled="isSaving"
            :aria-invalid="!!fieldErrors.title"
          />

          <p v-if="fieldErrors.title" class="text-xs font-medium text-destructive">
            {{ fieldErrors.title }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="edit-anime-description">
            Description
            <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
          </Label>

          <Textarea
            id="edit-anime-description"
            v-model="form.description"
            placeholder="Add a short description..."
            class="min-h-24 resize-none"
            :disabled="isSaving"
            :aria-invalid="!!fieldErrors.description"
          />

          <p v-if="fieldErrors.description" class="text-xs font-medium text-destructive">
            {{ fieldErrors.description }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="edit-anime-episodes">Episodes</Label>

          <Input
            id="edit-anime-episodes"
            v-model.number="form.episodes"
            type="number"
            min="1"
            placeholder="Enter total episodes"
            :disabled="isSaving"
            :aria-invalid="!!fieldErrors.episodes"
          />

          <p class="text-xs text-muted-foreground">
            Current progress: {{ currentProgress }} episode{{ currentProgress === 1 ? '' : 's' }}
            watched.
          </p>

          <p v-if="fieldErrors.episodes" class="text-xs font-medium text-destructive">
            {{ fieldErrors.episodes }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="edit-anime-status">Status</Label>

          <Select v-model="form.status" :disabled="isSaving">
            <SelectTrigger id="edit-anime-status" :aria-invalid="!!fieldErrors.status">
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

          <p v-if="fieldErrors.status" class="text-xs font-medium text-destructive">
            {{ fieldErrors.status }}
          </p>
        </div>

        <div class="flex items-center justify-between rounded-lg border p-4">
          <div class="space-y-1">
            <Label for="edit-anime-favorite" class="cursor-pointer"> Favorite </Label>

            <p class="text-xs text-muted-foreground">Add this anime to your favorites.</p>
          </div>

          <Switch
            id="edit-anime-favorite"
            v-model:checked="form.isFavorite"
            class="cursor-pointer data-checked:bg-teal-600"
            :disabled="isSaving"
          />
        </div>

        <div class="space-y-2">
          <Label for="edit-anime-website">
            Website
            <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
          </Label>

          <Input
            id="edit-anime-website"
            v-model="form.websiteUrl"
            type="url"
            placeholder="https://example.com"
            autocomplete="url"
            :disabled="isSaving"
            :aria-invalid="!!fieldErrors.websiteUrl"
          />

          <p v-if="fieldErrors.websiteUrl" class="text-xs font-medium text-destructive">
            {{ fieldErrors.websiteUrl }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="edit-anime-image">
            Replace Image
            <span class="ml-1 text-xs font-normal text-muted-foreground"> Optional </span>
          </Label>

          <Input
            id="edit-anime-image"
            type="file"
            accept="image/*"
            :disabled="isSaving"
            :aria-invalid="!!fieldErrors.image"
            @change="handleImageChange"
          />

          <p class="text-xs text-muted-foreground">
            Leave empty to keep the current image. Maximum file size is 5 MB.
          </p>

          <p v-if="selectedImage" class="text-xs text-muted-foreground">
            Selected: {{ selectedImage.name }}
          </p>

          <p v-if="fieldErrors.image" class="text-xs font-medium text-destructive">
            {{ fieldErrors.image }}
          </p>
        </div>

        <p v-if="errorMessage" role="alert" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          class="w-full sm:w-auto"
          :disabled="isSaving"
          @click="closeDialog"
        >
          Cancel
        </Button>

        <Button
          type="button"
          class="w-full sm:w-auto"
          :disabled="!isFormValid || isSaving"
          @click="saveChanges"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
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

import { updateAnimeSchema } from '@/lib/animeValidation'
import type { Anime, AnimeStatus, UpdateAnimeData } from '@/lib/useAnimeList'

interface EditAnimeForm {
  title: string
  description: string
  episodes: number
  status: AnimeStatus
  isFavorite: boolean
  websiteUrl: string
  image?: File
}

interface FieldErrors {
  title?: string
  description?: string
  episodes?: string
  status?: string
  websiteUrl?: string
  image?: string
}

const props = defineProps<{
  open: boolean
  anime: Anime
  isSaving: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [updates: UpdateAnimeData]
}>()

const form = reactive<EditAnimeForm>({
  title: '',
  description: '',
  episodes: 0,
  status: 'Plan to Watch',
  isFavorite: false,
  websiteUrl: '',
  image: undefined,
})

const selectedImage = ref<File | undefined>(undefined)

const fieldErrors = reactive<FieldErrors>({})

const isOpen = computed(() => props.open)

const currentProgress = computed(() => props.anime.progress)

const validationResult = computed(() => {
  return updateAnimeSchema.safeParse({
    title: form.title.trim(),
    description: form.description.trim(),
    episodes: form.episodes,
    status: form.status,
    isFavorite: form.isFavorite,
    websiteUrl: form.websiteUrl.trim(),
    image: form.image,
  })
})

const isFormValid = computed(() => {
  if (!validationResult.value.success) {
    return false
  }

  return form.episodes >= props.anime.progress
})

const clearFieldErrors = () => {
  fieldErrors.title = undefined
  fieldErrors.description = undefined
  fieldErrors.episodes = undefined
  fieldErrors.status = undefined
  fieldErrors.websiteUrl = undefined
  fieldErrors.image = undefined
}

const setFieldErrors = () => {
  clearFieldErrors()

  const result = validationResult.value

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (
        field === 'title' ||
        field === 'description' ||
        field === 'episodes' ||
        field === 'status' ||
        field === 'websiteUrl' ||
        field === 'image'
      ) {
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
    }
  }

  if (form.episodes < props.anime.progress) {
    fieldErrors.episodes = `Episodes cannot be lower than your current progress of ${props.anime.progress}.`
  }

  return result
}

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  selectedImage.value = file
  form.image = file

  fieldErrors.image = undefined

  if (file) {
    const result = updateAnimeSchema.shape.image?.safeParse(file)

    if (result && !result.success) {
      fieldErrors.image = result.error.issues[0]?.message ?? 'Invalid image file.'
    }
  }
}

const populateForm = () => {
  form.title = props.anime.title
  form.description = props.anime.description
  form.episodes = props.anime.episodes
  form.status = props.anime.status
  form.isFavorite = props.anime.isFavorite
  form.websiteUrl = props.anime.websiteUrl
  form.image = undefined

  selectedImage.value = undefined

  clearFieldErrors()
}

const closeDialog = () => {
  if (props.isSaving) {
    return
  }

  emit('update:open', false)
}

const handleDialogOpenChange = (open: boolean) => {
  if (props.isSaving && !open) {
    return
  }

  emit('update:open', open)
}

const saveChanges = () => {
  if (props.isSaving) {
    return
  }

  const result = setFieldErrors()

  if (!result.success || form.episodes < props.anime.progress) {
    return
  }

  emit('save', {
    title: result.data.title,
    description: result.data.description,
    episodes: result.data.episodes,
    status: result.data.status,
    isFavorite: result.data.isFavorite,
    websiteUrl: result.data.websiteUrl,
    image: result.data.image,
  })
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      populateForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.anime.id,
  () => {
    if (props.open) {
      populateForm()
    }
  },
)
</script>
