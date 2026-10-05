<template>
  <AlertDialog :open="open" @update:open="handleOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {{ anime.title }}?</AlertDialogTitle>

        <AlertDialogDescription>
          This will permanently remove this anime from your list. Your progress, favorite status,
          and other tracking information will also be removed.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <p v-if="errorMessage" role="alert" class="text-sm text-destructive">
        {{ errorMessage }}
      </p>

      <AlertDialogFooter class="flex-col gap-2 sm:flex-row">
        <AlertDialogCancel class="w-full sm:w-auto" :disabled="isDeleting" @click="closeDialog">
          Cancel
        </AlertDialogCancel>

        <AlertDialogAction
          class="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
          :disabled="isDeleting"
          @click.prevent="confirmDelete"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete Anime' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
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

import type { Anime } from '@/lib/useAnimeList'

const props = defineProps<{
  open: boolean
  anime: Anime
  isDeleting: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  confirm: []
}>()

const closeDialog = () => {
  if (props.isDeleting) {
    return
  }

  emit('update:open', false)
}

const handleOpenChange = (open: boolean) => {
  if (props.isDeleting && !open) {
    return
  }

  emit('update:open', open)
}

const confirmDelete = () => {
  if (props.isDeleting) {
    return
  }

  emit('confirm')
}
</script>
