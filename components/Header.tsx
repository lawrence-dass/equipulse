import Link from 'next/link'
import Image from 'next/image'
import NavItems from '@/components/NavItems'
import { searchStocks } from '@/lib/actions/finnhub.actions'

const Header = async () => {
  const initialStocks = await searchStocks();
  return (
    <div className='sticky top-0 header'>
        <div className='container header-wrapper'>
            <Link href="/">
                <Image src="/Equipulse.png" alt="logo" width={200} height={48} className='h-10 w-auto cursor-pointer' />
            </Link>
            <nav className='hidden sm:block'>
                <NavItems initialStocks={initialStocks} />
            </nav>
        </div>
    </div>
  )
}

export default Header
