// convex/convex.config.ts
import { defineApp } from 'convex/server'
import geospatial from '@convex-dev/geospatial/convex.config'

const app = defineApp()
app.use(geospatial)

export default app
