import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '@/stores'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('../views/GamesView.vue')
    },
    {
      path: '/games/:id',
      name: 'game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue')
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('../views/EditProfileView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('../views/SubscriptionView.vue')
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('../views/PaymentView.vue')
    },
    {
      path: '/postorder',
      name: 'postOrder',
      component: () => import('../views/PostOrderView.vue')
    },
    {
      path: '/postsubscription',
      name: 'postsubscription',
      component: () => import('../views/PostSubscriptionView.vue')
    },
    {
      path: '/developer',
      name: 'developer',
      meta: {
        requiresAuth: true
      },
      component: () => import('../views/DeveloperView.vue')
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../views/UploadView.vue')
    },    {
      path: '/library',
      name: 'library',
      component: () => import('../desktop-views/DesktopLibraryView.vue')
      // component: () => import('../views/LibraryView.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrderHistoryView.vue')
    },
    {
      path: '/webgame/:game',
      name: 'webgame',
      component: () => import('../views/WebGameView.vue')
    },
    {
      path: '/ach-pass',
      name: 'ach-pass',
      component: () => import('../views/AchievementsPassView.vue')
    },
    {
      path: '/developer/:game/achievements',
      name: 'manage-achievements',
      component: () => import('../views/AchievementManagerView.vue')
    },
    {
      path: '/developer/:game/edit',
      name: 'edit-game-data',
      component: () => import('../views/EditGameView.vue')
    },
    {
      path: '/games/:id/achievements',
      name: 'game-achievements',
      component: () => import('../views/GameAchievementsView.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/Policies/PrivacyPolicyView.vue')
    },
    {
      path: '/legal',
      name: 'legal',
      component: () => import('../views/Policies/LegalInfoView.vue')
    },
    {
      path: '/subscriber-agreement',
      name: 'subscriber-agreement',
      component: () => import('../views/Policies/SubscriberAgreementView.vue')
    },
    {
      path: '/refund',
      name: 'refund',
      component: () => import('../views/Policies/RefundView.vue')
    },
    {
      path: '/cookies',
      name: 'cookies',
      component: () => import('../views/Policies/CookiesView.vue')
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('../views/WishlistView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/payment-methods',
      name: 'payment-methods',
      component: () => import('../views/PaymentMethodsView.vue'),
      meta: {
        requiresAuth: true
      }
    },    {
      path: '/payment-methods/callback',
      name: 'payment-methods-callback',
      component: () => import('../views/PaymentMethodCallbackView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/subscription-management',
      name: 'subscription-management',
      component: () => import('../views/SubscriptionManagementView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/post-google-login',
      name: '/post-google-login',
      component: () => import ('../desktop-views/PostGoogleAuth.vue')
    }
  ],
  //@ts-ignore
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

//@ts-ignore
router.beforeEach(async (to, from, next) => {
  const auth = useAuth()
  
  try {
    await auth.checkToken(true)
    
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      next('/login')
    } else if (to.path === '/account' && !auth.isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  } catch (error) {
    console.error('Auth error in router guard:', error)
    

    if (to.meta.requiresAuth || to.path === '/account') {
      next('/login')
    } else {
      next()
    }
  }
})

export default router