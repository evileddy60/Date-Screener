"use client";

import { PrivacySettingsForm } from '@/components/privacy/PrivacySettingsForm';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Privacy Settings</h1>
        <p className="font-body text-lg text-foreground/80 mt-2">
          Your privacy is important to us. Configure your settings below.
        </p>
      </div>
      <PrivacySettingsForm />
    </div>
  );
}
