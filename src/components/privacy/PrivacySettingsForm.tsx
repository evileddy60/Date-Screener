"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Save } from 'lucide-react';

// Define more specific types if needed, e.g. for profileVisibility
const privacySchema = z.object({
  profileVisibility: z.string().default('all_users'), // e.g., 'all_users', 'recommenders_only', 'connections_only'
  allowRecommendationsFrom: z.string().default('all_recommenders'), // e.g., 'all_recommenders', 'known_recommenders', 'none'
  optOutOfAllRecommendations: z.boolean().default(false),
  emailNotificationsForMatches: z.boolean().default(true),
  emailNotificationsForUpdates: z.boolean().default(true),
});

type PrivacyFormData = z.infer<typeof privacySchema>;

interface PrivacySettings {
  profileVisibility: string;
  allowRecommendationsFrom: string;
  optOutOfAllRecommendations: boolean;
  emailNotificationsForMatches: boolean;
  emailNotificationsForUpdates: boolean;
}

// Mock function to get/save privacy settings
const getMockPrivacySettings = async (): Promise<PrivacySettings> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const stored = localStorage.getItem('privacySettings');
      if (stored) {
        resolve(JSON.parse(stored));
      } else {
        resolve({
          profileVisibility: 'all_users',
          allowRecommendationsFrom: 'all_recommenders',
          optOutOfAllRecommendations: false,
          emailNotificationsForMatches: true,
          emailNotificationsForUpdates: true,
        });
      }
    }, 500);
  });
};

const saveMockPrivacySettings = async (settings: PrivacySettings): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      localStorage.setItem('privacySettings', JSON.stringify(settings));
      resolve();
    }, 500);
  });
};


export function PrivacySettingsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: { // Default values will be overridden by fetched settings
        profileVisibility: 'all_users',
        allowRecommendationsFrom: 'all_recommenders',
        optOutOfAllRecommendations: false,
        emailNotificationsForMatches: true,
        emailNotificationsForUpdates: true,
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const settings = await getMockPrivacySettings();
      form.reset(settings); // Reset form with fetched values
      setIsLoading(false);
    };
    fetchSettings();
  }, [form]);


  const handleSubmit = async (data: PrivacyFormData) => {
    setIsLoading(true);
    await saveMockPrivacySettings(data);
    setIsLoading(false);
    toast({
      title: "Privacy Settings Saved!",
      description: "Your privacy preferences have been updated.",
    });
  };

  if (isLoading && !form.formState.isDirty) { // Show loader only on initial load
    return <p className="font-body text-center p-8">Loading privacy settings...</p>;
  }


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <ShieldCheck className="w-7 h-7" /> Privacy Controls
        </CardTitle>
        <CardDescription className="font-body">
          Manage how your information is shared and who can interact with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="profileVisibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Profile Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-body bg-card">
                        <SelectValue placeholder="Select who can see your profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="recommenders_only">Only My Recommenders</SelectItem>
                      <SelectItem value="connections_only">Only My Connections & Their Recommenders</SelectItem>
                      <SelectItem value="private">Private (Only visible if I initiate or accept)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="font-body">
                    Control who can view your detailed profile information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowRecommendationsFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Allow Recommendations From</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-body bg-card">
                        <SelectValue placeholder="Select who can recommend you" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_recommenders">Any Recommender</SelectItem>
                      <SelectItem value="my_network_recommenders">Recommenders in My Network</SelectItem>
                      <SelectItem value="specific_recommenders_only">Only Specific Recommenders I Approve</SelectItem>
                      <SelectItem value="none">Nobody (I will seek matches myself)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="font-body">
                    Choose who has permission to recommend potential matches to you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="optOutOfAllRecommendations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-secondary/20">
                  <div className="space-y-0.5">
                    <FormLabel className="font-body text-base">Opt-out of All Recommendations</FormLabel>
                    <FormDescription className="font-body">
                      If enabled, you will not receive any new match recommendations.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotificationsForMatches"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="font-body text-base">Email Notifications for New Matches</FormLabel>
                    <FormDescription className="font-body">
                      Receive an email when a new match is recommended to you.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emailNotificationsForUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="font-body text-base">Email Notifications for Updates</FormLabel>
                    <FormDescription className="font-body">
                      Receive emails about important account updates or messages.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />


            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg">
              {isLoading ? <Save className="mr-2 h-5 w-5 animate-pulse" /> : <Save className="mr-2 h-5 w-5" />} Save Preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
