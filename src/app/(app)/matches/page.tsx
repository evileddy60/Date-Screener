
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import Link from "next/link";

export default function MatchesPageRedirect() {
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
            This part of the application is currently being redesigned to fit our new Matchmaker focus!
            Soon, Matchmakers will be able to review AI-suggested matches between Profile Cards here.
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
          The previous "Matches" page was for single users. This functionality is being re-imagined.
          Future state: This page (or a similar one like `/potential-matches`) will display AI-suggested pairings of Profile Cards for Matcher review and approval.
        </AlertDescription>
      </Alert>
    </div>
  );
}
