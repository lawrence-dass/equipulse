import Link from 'next/link'
import Image from 'next/image'
import NavItems from '@/components/NavItems'
import UserDropdown from './UserDropdown'
import { searchStocks } from '@/lib/actions/finnhub.actions'


const Header = async ({ user }: { user: { id: string, name: string, email: string } }) => {
  const initialStocks = await searchStocks();
  return (
    <div className='sticky top-0 header'>
        <div className='container header-wrapper'>
            <Link href="/">
                <Image src="/Equipulse.png" alt="logo" width={200} height={48} className='h-12 w-auto cursor-pointer' />
            </Link>
            <nav className='hidden sm:block'>
                <NavItems initialStocks={initialStocks} />
            </nav>
            <UserDropdown user={user} initialStocks={initialStocks} />
        </div>
    </div>
  )
}

export default Header