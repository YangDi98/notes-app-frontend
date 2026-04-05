import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'unfonts.css'

import 'vuetify/styles'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'
import i18n from './i18n'

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
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.use(vuetify).mount('#app')
