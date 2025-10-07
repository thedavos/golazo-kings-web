import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'home',
        path: '',
        component: () => import('src/modules/home/pages/HomePage'),
      },
    ],
  },

  {
    path: '/lineups',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'lineups',
        path: '',
        component: () => import('src/modules/saved-lineups/pages/SavedLineupsPage/SavedLineupsPage.vue'),
      },
    ],
  },

  {
    path: '/explore-players',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'players',
        path: '',
        component: () => import('src/modules/players/pages/ExplorePlayersPage'),
      },
    ],
  },

  {
    path: '/guess-roster',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'guess-roster',
        path: '',
        component: () => import('src/modules/guess-roster/pages/GuessRosterPage'),
      },
    ],
  },

  {
    path: '/budget',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'budget-division',
        path: '',
        component: () => import('src/modules/budget/pages/SalaryDivisionPage'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/modules/shared/pages/ErrorNotFound.vue'),
  },
];

export default routes;
