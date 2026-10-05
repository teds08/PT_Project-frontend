<template>
  <div v-if="websiteUrl" class="mb-8">
    <a
      :href="websiteUrl"
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
</template>

<script setup lang="ts">
defineProps<{
  websiteUrl: string
}>()
</script>
