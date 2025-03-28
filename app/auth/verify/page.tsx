"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock } from "lucide-react"
import { Suspense } from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Componente que usa useSearchParams envuelto en Suspense
function VerifyContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Verificación de Email</h1>
        
        {error ? (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        ) : message ? (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {message}
          </div>
        ) : (
          <div className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg">
            Tu email ha sido verificado correctamente. Ya puedes iniciar sesión.
          </div>
        )}
        
        <div className="mt-6">
          <a href="/auth/login" className="w-full block text-center py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/80">
            Ir a Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  )
}

// Página principal que usa Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center">Cargando...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

// Necesario para Next.js: Indicar que esta página es dinámica
export const dynamic = 'force-dynamic'

function VerifyPageContent() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading")

  useEffect(() => {
    const verifySession = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Intentar actualizar la sesión
        const { error } = await supabase.auth.refreshSession()
        
        if (error) {
          console.error("Error de verificación:", error)
          setStatus("error")
          return
        }
        
        // Comprobar el estado de la sesión
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setStatus("verified")
          // Redirigir después de un breve retardo
          setTimeout(() => router.push("/dashboard"), 1500)
        } else {
          setStatus("error")
        }
      } catch (error: any) {
        console.error("Error:", error)
        setStatus("error")
      }
    }

    verifySession()
  }, [router])

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "loading" && "Verificando cuenta"}
            {status === "verified" && "¡Verificación exitosa!"}
            {status === "error" && "Error de verificación"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Espera mientras verificamos tu cuenta..."}
            {status === "verified" && "Tu cuenta ha sido verificada correctamente."}
            {status === "error" && "No se pudo verificar tu cuenta. Por favor, intenta iniciar sesión de nuevo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          {status === "loading" && <Clock className="h-16 w-16 text-muted-foreground animate-pulse" />}
          {status === "verified" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === "error" && <ArrowLeft className="h-16 w-16 text-red-500" />}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Esto puede tomar unos momentos...</p>
          )}
          {status === "verified" && (
            <p className="text-sm text-muted-foreground">Redirigiendo al dashboard...</p>
          )}
          {status === "error" && (
            <Button asChild variant="default">
              <Link href="/login">Volver al inicio de sesión</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 