
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ZapOff } from 'lucide-react'; 

export default function AISuggestionsPageRemoved() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-muted p-4 rounded-full w-fit mb-4">
            <ZapOff className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline text-2xl text-foreground">Feature Removed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-muted-foreground mb-6">
            The AI Matching Tips feature has been removed from the application.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
