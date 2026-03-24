'use client';

import AuthContainer from "@/components/AuthContainer";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <AuthContainer />
    </Suspense>
  );
}
