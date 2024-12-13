import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router'
import KastaView from '../views/KastaView.vue'
import InvadersView from '../views/InvadersView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: InvadersView,
      meta: {
        title: 'Kas | Invaders',
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/kasta',
      name: 'kasta',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: KastaView,
      meta: {
        title: 'Santa Kas'
      }
    },
    {
      path: '/invaders',
      name: 'invaders',
      component: InvadersView,
      meta: {
        title: 'Kas | Invaders',
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      }
    }
  ],
});

const DEFAULT_TITLE = 'Kaspa';
const DEFAULT_VIEWPORT: string = 'width=device-width, initial-scale=1.0';
router.afterEach((to, from) => {
    nextTick(() => {
      // @ts-ignore
      document.title = to.meta.title || DEFAULT_TITLE;

      const viewport = document.querySelector('head meta[name="viewport"]');
      viewport?.setAttribute('content', to.meta.viewport || DEFAULT_VIEWPORT)
    });
});

export default router
