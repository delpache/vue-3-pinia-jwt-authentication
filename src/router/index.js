import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store';

import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // Le fractionnement du code au niveau des routes
      // cela génère un chunk séparé (About. [hash].js) pour cette route
      // qui est chargé paresseusement lorsque la route est visitée.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      component: () => import('../views/auth/LoginView.vue')
    }
  ]
})

router.beforeEach(async (to) => {
    // Redirige vers la page de connexion si vous n'êtes pas connecté
    // et que vous essayez d'accéder à une page à accès restreint.
    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path)
    const auth = useAuthStore()

    if (authRequired && !auth.user) {
        auth.returnUrl = to.fullPath

        return '/login'
    }
})

export default router
