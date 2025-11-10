import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Feast Finder - Discover Amazing Restaurants',
      },
      {
        name: 'description',
        content:
          'Discover restaurant week events and amazing dining experiences near you. Find exclusive prix-fixe menus, special tastings, and culinary events.',
      },
      {
        property: 'og:title',
        content: 'Feast Finder - Discover Amazing Restaurants',
      },
      {
        property: 'og:description',
        content:
          'Discover restaurant week events and amazing dining experiences near you. Find exclusive prix-fixe menus, special tastings, and culinary events.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: '/og-image.svg',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Feast Finder - Discover Amazing Restaurants',
      },
      {
        name: 'twitter:description',
        content:
          'Discover restaurant week events and amazing dining experiences near you. Find exclusive prix-fixe menus, special tastings, and culinary events.',
      },
      {
        name: 'twitter:image',
        content: '/og-image.svg',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
