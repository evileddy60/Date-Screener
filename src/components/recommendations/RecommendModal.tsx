
"use client";

// This component is no longer used directly as RecommendModal.
// It has been replaced by CreateEditProfileCardModal.tsx for the new Profile Card concept.
// Keeping the file for reference or if it needs to be repurposed later.
// For now, it's effectively deprecated in the current app flow.

import { useState, useEffect } from 'react';
import type { UserProfile, Recommendation } from '@/types'; // Types would need to change
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, UserCheck, X } from 'lucide-react';

interface DeprecatedRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleToRecommendFor: UserProfile; 
  onRecommendationMade: (newRecommendation: Recommendation) => void;
}

export function RecommendModal({ isOpen, onClose, singleToRecommendFor, onRecommendationMade }: DeprecatedRecommendModalProps) {
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-card opacity-50 cursor-not-allowed">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <UserCheck className="w-7 h-7" /> DEPRECATED: Recommend a Match for {singleToRecommendFor?.name}
          </DialogTitle>
          <DialogDescription className="font-body">
            This modal (RecommendModal) is deprecated and replaced by CreateEditProfileCardModal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <p className="text-center font-body text-muted-foreground">This component is no longer in use.</p>
        </div>
        <DialogFooter className="sm:justify-between pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
