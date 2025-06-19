
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Users, BookUser, HeartHandshake, Info, Mail, CheckCircle, Search } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Info className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-4xl text-primary">About Date Screener</CardTitle>
          <CardDescription className="font-body text-lg text-foreground/80">
            Connecting friends, with a little help from you!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-body text-foreground/90">
          <section>
            <h2 className="font-headline text-2xl text-primary mb-2 flex items-center gap-2"><Sparkles className="h-6 w-6"/>What is Date Screener?</h2>
            <p>
              Date Screener is a unique platform designed for <strong className="text-primary">Matchmakers</strong> (that's you!) to help your single friends find meaningful connections. 
              Instead of your friends swiping endlessly, you thoughtfully create profiles for them, highlighting their best qualities and what they're looking for.
              Our system then helps you discover potential matches with friends of other Matchmakers on the platform.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-primary mb-2 flex items-center gap-2"><BookUser className="h-6 w-6"/>How to Use Date Screener: Your Guide</h2>
            <ol className="list-decimal list-inside space-y-3 pl-4">
              <li>
                <strong className="text-primary">Create Profile Cards for Your Friends:</strong> Navigate to "Profile Cards" from the menu. Here, you'll craft detailed profiles for your single friends. Include their bio, interests, photos, and preferences for a potential partner. The more detail, the better the AI can assist!
              </li>
              <li>
                <strong className="text-primary">Find Potential Matches:</strong> Once a Profile Card is created, use the "Find Match for [Friend's Name]" button on their card. Our AI system will analyze other Profile Cards in the network (created by other Matchmakers) and suggest potential compatible pairings.
              </li>
              <li>
                <strong className="text-primary">Review Match Suggestions:</strong> Go to "Review Matches". Here you'll see the AI's suggestions, showing your friend's card alongside a potential match's card. You'll see why the AI thought they might be a good fit.
              </li>
              <li>
                <strong className="text-primary">Matcher Approval:</strong> You and the Matchmaker of the other friend will independently decide to "Approve" or "Decline" the suggested pairing for your respective friends.
              </li>
              <li>
                <strong className="text-primary">(Simulated) Friend Notification:</strong> If <strong className="text-primary">both</strong> Matchmakers approve the potential match, the system will (currently simulate) sending an introductory email to both friends, letting them know about the potential connection and allowing them to privately accept or decline.
              </li>
              <li>
                <strong className="text-primary">Mutual Acceptance & Connection:</strong> If both friends accept the introduction, congratulations! It's a mutual match. At this point, you (the Matchmakers) would typically facilitate sharing contact information so they can connect. (Direct contact info sharing is not yet implemented in-app).
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-primary mb-2 flex items-center gap-2"><Users className="h-6 w-6"/>The Power of Collaboration</h2>
            <p>
              Date Screener believes in the power of community and trusted recommendations. By collaborating with other Matchmakers, you expand the possibilities for your friends far beyond their immediate circles.
            </p>
          </section>

           <section className="text-center pt-6">
             <Button asChild size="lg">
                <Link href="/dashboard">
                    <HeartHandshake className="mr-2 h-5 w-5" /> Back to Dashboard
                </Link>
             </Button>
           </section>

        </CardContent>
      </Card>
    </div>
  );
}
