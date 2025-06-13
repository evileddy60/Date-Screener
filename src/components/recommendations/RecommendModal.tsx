"use client";

import { useState, useEffect } from 'react';
import type { UserProfile, Recommendation } from '@/types';
import { mockUserProfiles, mockRecommendations } from '@/lib/mockData'; // For finding potential matches
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, UserCheck, X } from 'lucide-react';

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleToRecommendFor: UserProfile; // The person you are recommending FOR
  onRecommendationMade: (newRecommendation: Recommendation) => void;
}

export function RecommendModal({ isOpen, onClose, singleToRecommendFor, onRecommendationMade }: RecommendModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [potentialMatchId, setPotentialMatchId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [familyIntro, setFamilyIntro] = useState('');
  const [availableMatches, setAvailableMatches] = useState<UserProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      // Filter out the current user, the person being recommended for, and non-singles
      const potential = mockUserProfiles.filter(
        user => user.role === 'single' && user.id !== currentUser.id && user.id !== singleToRecommendFor.id
      );
      setAvailableMatches(potential);
    }
  }, [isOpen, currentUser, singleToRecommendFor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!potentialMatchId || !notes || !currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a match and add notes.' });
      return;
    }
    setIsSubmitting(true);

    const potentialMatchProfile = mockUserProfiles.find(p => p.id === potentialMatchId);
    if (!potentialMatchProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected match profile not found.' });
        setIsSubmitting(false);
        return;
    }

    const newRecommendation: Recommendation = {
      id: `rec-${Date.now()}`,
      recommenderId: currentUser.id,
      recommenderName: currentUser.name,
      singleId: singleToRecommendFor.id,
      potentialMatchId,
      potentialMatchName: potentialMatchProfile.name,
      potentialMatchPhotoUrl: potentialMatchProfile.photoUrl,
      notes,
      familyIntro,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      mockRecommendations.push(newRecommendation); // Add to mock data
      onRecommendationMade(newRecommendation);
      toast({ title: 'Recommendation Sent!', description: `You've recommended ${potentialMatchProfile.name} for ${singleToRecommendFor.name}.` });
      setIsSubmitting(false);
      handleClose();
    }, 1000);
  };
  
  const handleClose = () => {
    setPotentialMatchId('');
    setNotes('');
    setFamilyIntro('');
    onClose();
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={ (openStatus) => { if (!openStatus) handleClose(); }}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <UserCheck className="w-7 h-7" /> Recommend a Match for {singleToRecommendFor.name}
          </DialogTitle>
          <DialogDescription className="font-body">
            Select someone you think would be a great match and add your personal touch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div>
            <Label htmlFor="potentialMatch" className="font-body text-foreground/80">Select Potential Match</Label>
            <Select value={potentialMatchId} onValueChange={setPotentialMatchId}>
              <SelectTrigger id="potentialMatch" className="w-full font-body bg-card">
                <SelectValue placeholder="Choose a person..." />
              </SelectTrigger>
              <SelectContent>
                {availableMatches.length > 0 ? (
                  availableMatches.map(user => (
                    <SelectItem key={user.id} value={user.id} className="font-body">
                      {user.name} ({user.bio?.substring(0,30) + (user.bio && user.bio.length > 30 ? '...' : '')})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-matches" disabled className="font-body">No available singles found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes" className="font-body text-foreground/80">Your Recommendation Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Why do you think they'd be a good match for ${singleToRecommendFor.name}?`}
              required
              className="min-h-[100px] font-body bg-card"
            />
          </div>
          <div>
            <Label htmlFor="familyIntro" className="font-body text-foreground/80">Family Introduction (Optional)</Label>
            <Textarea
              id="familyIntro"
              value={familyIntro}
              onChange={(e) => setFamilyIntro(e.target.value)}
              placeholder="Any notes from family or a brief family introduction, if applicable."
              className="min-h-[80px] font-body bg-card"
            />
          </div>
          <DialogFooter className="sm:justify-between pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !potentialMatchId} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? <Send className="mr-2 h-4 w-4 animate-pulse" /> : <Send className="mr-2 h-4 w-4" />}
              Send Recommendation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
