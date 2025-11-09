import { Suspense, lazy } from 'react'
import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { Center, Flex, Spinner, Text } from '@chakra-ui/react'

// Loading fallback component
function HomeLoading() {
  return (
    <Center h="100vh" color="text.secondary">
      <Flex direction="column" align="center" gap={4}>
        <Spinner size="xl" color="brand.solid" />
        <Text>Loading...</Text>
      </Flex>
    </Center>
  )
}

// Lazy load the Home component (client-side only)
const LazyHome = lazy(() =>
  import('~/components/HomeClient').then((module) => ({
    default: module.HomeClient,
  })),
)

export const Route = createFileRoute('/')({
  component: () => (
    <ClientOnly fallback={<HomeLoading />}>
      <Suspense fallback={<HomeLoading />}>
        <LazyHome />
      </Suspense>
    </ClientOnly>
  ),
})
