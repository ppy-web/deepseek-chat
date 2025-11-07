import { createApp } from "vue"
import "normalize.css"
import "highlight.js/styles/github-dark.css"
import "animate.css"
import "./index.scss"

import pinia from '@/store'

import App from "./App.vue"
import router from "./router.js"

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount("#app")
