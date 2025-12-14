'use client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./button"
import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar" 


const UserDropdown = () => {
    const router = useRouter()
    const handleSignOut = async () => {
        try {
            router.push('/sign-in')
            toast.success('Signed out successfully')
            router.refresh()
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://github.com/shadcn.png',
    }
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className='flex items-center gap-3 text-gray-400 hover'>
            <Avatar className='h-8 w-8'>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className='bg-primary text-primary-foreground'>CN</AvatarFallback>
            </Avatar>
            <div className='hidden md:flex flex-col items-start'>
                <span className="text-base font-medium text-gray-400">{user.name}</span>
            </div>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
            <DropdownMenuLabel>
            <div className="flex relative items-center gap-3 py-2">
                <Avatar className='h-10 w-10'>
                    <AvatarImage src="https://github.com/shadcn.png" /> 
                    <AvatarFallback className='bg-primary text-primary-foreground'>CN</AvatarFallback>
                </Avatar>
                <div className='flex flex-col items-start'>
                    <span className="text-base font-medium text-gray-400">{user.name}</span>
                    <span className="text-sm text-gray-400">{user.email}</span>
                </div>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-gray-200' />
            <DropdownMenuItem onClick={handleSignOut} className="text-gray-400 text-md font-medium  focus:bg-transparent focus:text-gray-400 transition-colors cursor-pointer">
                <LogOutIcon className="h-4 w-4 mr-2"  />
                <span className="text-gray-400 text-md font-medium  focus:bg-transparent focus:text-gray-400">Sign Out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;