"use client";

import { MatchImprovementForm } from '@/components/ai/MatchImprovementForm';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AISuggestionsPage() {
  const { currentUser } = useAuth();

  if (currentUser && currentUser.role !== 'recommender') {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-headline">Access Denied</AlertTitle>
        <AlertDescription className="font-body">
          This feature is only available for users with the 'Recommender' role.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">AI-Powered Matching Insights</h1>
        <p className="font-body text-lg text-foreground/80 mt-2">
          Leverage artificial intelligence to refine your matchmaking skills and make better recommendations.
        </p>
      </div>
      <MatchImprovementForm />
    </div>
  );
}
