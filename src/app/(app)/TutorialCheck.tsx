"use client";

import { useState, useEffect } from "react";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { markTutorialAsViewed } from "./actions";

export default function TutorialCheck({
  userId,
  tutorialViewed,
  role,
}: {
  userId: string;
  tutorialViewed: boolean;
  role?: string;
}) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial if user hasn't viewed it yet
  useEffect(() => {
    if (!tutorialViewed) {
      setShowTutorial(true);
    }
  }, [tutorialViewed]);

  async function handleTutorialComplete() {
    try {
      // Mark tutorial as viewed in database using server action
      await markTutorialAsViewed(userId);
      setShowTutorial(false);
    } catch (error) {
      console.error("Failed to mark tutorial as viewed:", error);
      setShowTutorial(false);
    }
  }

  function handleTutorialSkip() {
    // Don't mark as viewed, just close
    setShowTutorial(false);
  }

  return showTutorial ? (
    <OnboardingTutorial role={role} onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
  ) : null;
}
