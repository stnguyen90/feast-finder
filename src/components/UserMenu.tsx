import {
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Portal,
} from '@chakra-ui/react'
import { FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useAuthActions } from '@convex-dev/auth/react'

interface UserMenuProps {
  userName: string
  onSignOut?: () => void
}

export function UserMenu({ userName, onSignOut }: UserMenuProps) {
  const { signOut } = useAuthActions()

  const handleSignOut = async () => {
    await signOut()
    if (onSignOut) {
      onSignOut()
    }
  }

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton
          aria-label={`User menu for ${userName}`}
          variant="ghost"
          size="md"
          color="white"
          _hover={{ bg: 'red.800' }}
          _open={{ bg: 'red.800' }}
        >
          <FaUser />
        </IconButton>
      </MenuTrigger>
      <Portal>
        <MenuPositioner>
          <MenuContent>
            <MenuItem value="signout" onClick={handleSignOut}>
              <FaSignOutAlt />
              <span>Sign Out</span>
            </MenuItem>
          </MenuContent>
        </MenuPositioner>
      </Portal>
    </MenuRoot>
  )
}
