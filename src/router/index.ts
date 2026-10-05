import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Discover from '@/views/Discover.vue'
import AnimeDetails from '@/views/AnimeDetails.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/discover',
      name: 'discover',
      component: Discover,
    },
    {
      path: '/anime/:id',
      name: 'anime-details',
      component: AnimeDetails,
    },
  ],
})

export default router
