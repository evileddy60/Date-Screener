
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MatchDetailPageRedirect() {
  const params = useParams();
  const matchId = params.matchId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Page Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-muted-foreground mb-6">
            The way match details are displayed is being updated for our new Matchmaker focus.
            You tried to access details for ID: <strong>{matchId}</strong>.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
       <Alert className="max-w-lg">
        <Construction className="h-4 w-4" />
        <AlertTitle className="font-headline">Developer Note</AlertTitle>
        <AlertDescription className="font-body">
          This detail page is being redesigned. It will show details of a `PotentialMatch` between two `ProfileCard`s, allowing Matchers to review and approve/reject.
        </AlertDescription>
      </Alert>
    </div>
  );
}
