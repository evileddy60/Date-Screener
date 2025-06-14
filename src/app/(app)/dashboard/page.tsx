
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, BookUser, Sparkles, ShieldCheck, ArrowRight, Users, ClipboardCheck } from 'lucide-react'; // Removed SearchHeart
import { USER_ROLES } from '@/lib/constants';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  const QuickLink = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="block group">
      <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-headline text-xl text-primary group-hover:underline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-body text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardContent className="pt-0">
           <Button variant="ghost" size="sm" className="text-primary group-hover:translate-x-1 transition-transform">
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
  
  if (currentUser.role !== USER_ROLES.RECOMMENDER) {
    return (
        <Card className="max-w-lg mx-auto mt-10">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>This area is for Matchmakers only. Please sign up or log in as a Matchmaker.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild><Link href="/auth/login">Go to Login</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/80 via-primary to-accent/60 text-primary-foreground shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-8">
          <div>
            <h1 className="font-headline text-4xl font-bold mb-2">Hello, Matchmaker {currentUser.name}!</h1>
            <p className="font-body text-lg opacity-90">
              Ready to create profiles for your friends and find them great matches?
            </p>
          </div>
          <Image 
            src="https://placehold.co/300x200/FFACD/FFFFFF?text=Matchmaker+Zone"
            alt="Matchmaker illustration"
            data-ai-hint="people connecting hearts"
            width={250}
            height={150}
            className="rounded-lg mt-6 md:mt-0 shadow-md object-cover"
          />
        </div>
      </Card>

      <section>
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Your Matchmaking Toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickLink href="/profile" icon={UserCircle} title="My Matchmaker Profile" description="View and update your personal information." />
          <QuickLink href="/profile-cards" icon={BookUser} title="Manage Profile Cards" description="Create and manage profiles for your single friends. Find matches from here." />
          <QuickLink href="/potential-matches" icon={Users} title="Review Matches" description="Review and approve/reject AI-suggested matches between profile cards." />
          <QuickLink href="/suggestions" icon={Sparkles} title="AI Matching Tips" description="Get AI-powered advice to improve your matchmaking." />
          <QuickLink href="/privacy" icon={ShieldCheck} title="Privacy Settings" description="Manage your account settings and preferences." />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">New to Matchmaking?</CardTitle>
          <CardDescription className="font-body">Start by creating Profile Cards for your single friends. The more detail, the better the matches!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/profile-cards">Create a Profile Card</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
