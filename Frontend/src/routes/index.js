// All components mapping with path for internal routes

import { lazy } from 'react'
// const  ViewBook =lazy(() => import('../features/viewbook/ViewBook')) 

const Dashboard = lazy(() => import('../pages/protected/Dashboard'))

const Welcome = lazy(() => import('../pages/protected/Welcome'))
const Page404 = lazy(() => import('../pages/protected/404'))
const Blank = lazy(() => import('../pages/protected/Blank'))
const Charts = lazy(() => import('../pages/protected/Charts'))
const Leads = lazy(() => import('../pages/protected/Leads'))
const userBooks = lazy(() => import('../pages/protected/Integration'))
const publicBooks = lazy(() => import('../pages/protected/PublicBooks'))
const QA_Generation=lazy(() => import('../pages/protected/QA_Generation'))
const Calendar = lazy(() => import('../pages/protected/Calendar'))
const Team = lazy(() => import('../pages/protected/Team'))
const Transactions = lazy(() => import('../pages/protected/Transactions'))
const Bills = lazy(() => import('../pages/protected/Bills'))
const ProfileSettings = lazy(() => import('../pages/protected/ProfileSettings'))
const GettingStarted = lazy(() => import('../pages/GettingStarted'))
const DocFeatures = lazy(() => import('../pages/DocFeatures'))
const DocComponents = lazy(() => import('../pages/DocComponents'))
const ViewUserBook = lazy(() => import('../pages/protected/ViewBook'))


const routes = [
  {
    path: '/dashboard', // the url
    component: Dashboard, // view rendered

  },
  // {
  //   path: '/users', // the url
  //   component: Users, // view rendered

  // },

  {
    path: '/welcome', // the url
    component: Welcome, // view rendered
  },
 
  {
    path: '/Upload-Books',
    component: Leads,
  },
  {
    path: '/Q&A-Generation', // the url
    component: QA_Generation, // view rendered
  },
  {
    path: '/settings-team',
    component: Team,
  },
  {
    path: '/calendar',
    component: Calendar,
  },
  {
    path: '/Users',
    component: Transactions,
  },
  {
    path: '/Users/view-book/:id',
    component: ViewUserBook,
  },

  {
    path: '/settings-profile',
    component: ProfileSettings,
  },
  {
    path: '/settings-billing',
    component: Bills,
  },
  {
    path: '/getting-started',
    component: GettingStarted,
  },
  {
    path: '/features',
    component: DocFeatures,
  },
  {
    path: '/components',
    component: DocComponents,
  },
  {
    path: '/userBooks',
    component: userBooks,
  },
  {
    path: '/publicBooks',
    component: publicBooks,
  },
  {
    path: '/charts',
    component: Charts,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },
 
]

export default routes
