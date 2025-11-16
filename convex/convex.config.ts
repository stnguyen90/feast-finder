// convex/convex.config.ts
import { defineApp } from 'convex/server'
import geospatial from '@convex-dev/geospatial/convex.config'
import autumn from '@useautumn/convex/convex.config'

const app = defineApp()
app.use(geospatial)
app.use(autumn)

export default app
