import Link from 'next/link'
import Image from 'next/image'
import NavItems from './NavItems'
import UserDropdown from './UserDropdown'


const Header = () => {
  return (
    <div className='sticky top-0 header'>
        <div className='container header-wrapper'>
            <Link href="/">
                <Image src="/Equipulse.png" alt="logo" width={200} height={48} className='h-12 w-auto cursor-pointer' />
            </Link>
            <nav className='hidden sm:block'>
                <NavItems />
            </nav>
            <UserDropdown />
        </div>
    </div>
  )
}

export default Header