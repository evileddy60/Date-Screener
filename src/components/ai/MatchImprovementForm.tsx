"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getMatchImprovementSuggestions } from '@/ai/flows/match-improvement-suggestions';
import type { MatchImprovementSuggestionsInput, MatchImprovementSuggestionsOutput } from '@/ai/flows/match-improvement-suggestions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const suggestionSchema = z.object({
  userProfile: z.string().min(50, "User profile summary needs to be at least 50 characters."),
  recommenderProfile: z.string().min(50, "Recommender profile summary needs to be at least 50 characters."),
  matchFeedback: z.string().min(30, "Match feedback needs to be at least 30 characters."),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

export function MatchImprovementForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MatchImprovementSuggestionsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      userProfile: '',
      recommenderProfile: '',
      matchFeedback: '',
    },
  });

  const handleSubmit = async (data: SuggestionFormData) => {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const input: MatchImprovementSuggestionsInput = {
        userProfile: data.userProfile,
        recommenderProfile: data.recommenderProfile,
        matchFeedback: data.matchFeedback,
      };
      const result = await getMatchImprovementSuggestions(input);
      setSuggestions(result);
      toast({
        title: "Suggestions Generated!",
        description: "AI has provided some tips to improve matches.",
      });
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Suggestions",
        description: "Could not fetch suggestions from AI. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Sparkles className="w-7 h-7" /> AI Matchmaking Tips
        </CardTitle>
        <CardDescription className="font-body">
          Enter details about the single, yourself (as recommender), and past feedback to get AI-powered suggestions for better future matches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Single's Profile Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the single person: their personality, key preferences, what they are looking for, etc."
                      {...field}
                      className="min-h-[100px] font-body bg-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recommenderProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Your Recommending Style/Approach</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your relationship with the single, your typical approach to recommending, or any biases you might have."
                      {...field}
                      className="min-h-[100px] font-body bg-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matchFeedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Feedback from Past Matches</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize feedback received from or about previous matches (both successful and unsuccessful introductions)."
                      {...field}
                      className="min-h-[100px] font-body bg-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Get AI Suggestions
            </Button>
          </form>
        </Form>
      </CardContent>
      {suggestions && suggestions.adviceTags && suggestions.adviceTags.length > 0 && (
        <CardFooter className="flex flex-col items-start space-y-3 pt-6 border-t">
            <h3 className="font-headline text-lg text-foreground">Suggested Advice Tags:</h3>
            <div className="flex flex-wrap gap-2">
                {suggestions.adviceTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="font-body text-sm bg-accent text-accent-foreground px-3 py-1">
                        {tag}
                    </Badge>
                ))}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
