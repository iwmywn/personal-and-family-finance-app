export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-10">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  )
}
