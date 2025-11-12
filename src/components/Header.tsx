import { Box, Flex, Heading, IconButton } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { FaUser, FaUtensils } from 'react-icons/fa6'
import { api } from '../../convex/_generated/api'
import { ColorModeToggle } from './ColorModeToggle'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  onSignInClick: () => void
}

function AuthenticatedHeader() {
  const currentUser = useQuery(api.users.getCurrentUser)
  
  if (!currentUser) {
    return null
  }

  return <UserMenu userName={currentUser.name || 'User'} />
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <Flex
      flexShrink={0}
      p={4}
      bg="brand.solid"
      boxShadow="sm"
      align="center"
      justify="space-between"
    >
      <Box flex={1} textAlign="center">
        <Link to="/">
          <Flex align="center" justify="center" gap={2}>
            <FaUtensils size={32} color="var(--chakra-colors-brand-contrast)" />
            <Heading size="2xl" color="brand.contrast">
              Feast Finder
            </Heading>
          </Flex>
        </Link>
      </Box>
      <Flex position="absolute" right={4} gap={2} align="center">
        <ColorModeToggle />
        <Authenticated>
          <AuthenticatedHeader />
        </Authenticated>
        <Unauthenticated>
          <IconButton
            aria-label="Sign In"
            variant="ghost"
            size="md"
            onClick={onSignInClick}
            color="brand.contrast"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >
            <FaUser />
          </IconButton>
        </Unauthenticated>
      </Flex>
    </Flex>
  )
}
