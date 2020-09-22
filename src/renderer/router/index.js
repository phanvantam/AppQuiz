import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/listing',
      name: 'listing',
      component: require('@/components/Pages/Listing').default
    },
    {
      path: '/form',
      name: 'form',
      component: require('@/components/Pages/Form').default
    },
    {
      path: '/threads/listing',
      name: 'threads.listing',
      component: require('@/components/Threads/Listing').default
    },
    {
      path: '/threads/create',
      name: 'threads.create',
      component: require('@/components/Threads/Create').default
    },
    {
      path: '/questions/listing/:id',
      name: 'questions.listing',
      component: require('@/components/Questions/Listing').default
    },
    {
      path: '/questions/create/:id',
      name: 'questions.create',
      component: require('@/components/Questions/Create').default
    },
    {
      path: '/questions/update/:id',
      name: 'questions.update',
      component: require('@/components/Questions/Update').default
    },
    {
      path: '*',
      redirect: '/threads/listing'
    }
  ]
})
