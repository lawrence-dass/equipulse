import Header from '@/components/Header'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container py-6">
        {children}
      </div>
    </main>
  )
}

export default Layout
