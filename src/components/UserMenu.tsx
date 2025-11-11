import { Button, MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@chakra-ui/react'
import { FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useAuthActions } from '@convex-dev/auth/react'

interface UserMenuProps {
  userName: string
}

export function UserMenu({ userName }: UserMenuProps) {
  const { signOut } = useAuthActions()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
      <MenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FaUser />
          <span>{userName}</span>
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="signout" onClick={handleSignOut}>
          <FaSignOutAlt />
          <span>Sign Out</span>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}
