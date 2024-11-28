// app/unauthorized/page.tsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShieldX } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { t } = useTranslation(); // Hook de traducción
  return (
    <div className=" bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <ShieldX className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl font-bold text-center">
              {t('unauthorized.card.title')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
          {t('unauthorized.card.content')}
          </p>
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="w-full"
          >
            {t('unauthorized.card.button')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}