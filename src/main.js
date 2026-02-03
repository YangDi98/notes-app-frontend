import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'unfonts.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'system', // 'light' | 'dark' | 'system'
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.indigo.darken3,
          secondary: colors.indigo.lighten1,
          success: colors.lightGreen.darken4,
          failure: colors.red.darken4,
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(vuetify).mount('#app')
