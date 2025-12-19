"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>
            Un email de vérification a été envoyé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nous avons envoyé un lien de vérification à{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Veuillez vérifier votre boîte de réception et cliquer sur le lien pour
            activer votre compte.
          </p>

          <div className="pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/signin">Retour à la connexion</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
