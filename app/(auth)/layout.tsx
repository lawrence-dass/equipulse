import Link from "next/link"
import Image from "next/image"
import { StarIcon } from "lucide-react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-layout">
        <section className='auth-left-section scrollbar-hide-default'>
            <Link href="/" className='auth-logo'>
                <Image src="/Equipulse.png" alt="logo" width={200} height={48} className='h-8 w-auto cursor-pointer' />
            </Link>
            <div className='pb-6 lg:pb-8 flex-1'>
                {children}
            </div>
        </section>
        <section className='auth-right-section'>
            <div className='z-10 relative lg:mt-4 lg:mb-16'>
                <blockquote className='auth-blockquote'>
                Equipulse is a platform for managing your portfolio and trading your stocks. Where you can track your portfolio and make trades in real time.   
                </blockquote>
                <div className='flex items-center justify-center gap-2'>
                    <div>
                        <cite className='auth-testimonial-author'>
                            John Doe
                        </cite>
                        <span className='max-md:text-xs text-gray-500'>
                            Retail Investor
                        </span>
                        <div className='flex items-center justify-center gap-0.5'   >
                        <StarIcon className='h-4 w-4 text-yellow-500' />
                        <StarIcon className='h-4 w-4 text-yellow-500' />
                        <StarIcon className='h-4 w-4 text-yellow-500' />
                        <StarIcon className='h-4 w-4 text-yellow-500' />    
                        <StarIcon className='h-4 w-4 text-yellow-500' />
                    </div>
                    </div>
                    <div>
                        <span className='max-md:text-xs text-gray-500'>
                            Verified Customer
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex-1 relative">
                <Image src="/auth-dashboard-preview.png" alt="dashboard preview" width={1024} height={768} className='auth-dashboard-preview' />
                <div className='absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-gray-900 to-transparent' />
                <div className='absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-gray-900 to-transparent' />
                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 to-transparent' />
                <div className='absolute top-0 right-0 w-full h-full bg-gradient-to-b from-gray-900 to-transparent' />
                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-900 to-transparent' />
                <div className='absolute top-0 right-0 w-full h-full bg-gradient-to-r from-gray-900 to-transparent' />
                <div className='absolute bottom-0 left-0 w-full h-full bg-gradient-to-l from-gray-900 to-transparent' />
                <div className='absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-gray-900 to-transparent' />
            </div>
        </section>
    </div>
  )
}

export default AuthLayout