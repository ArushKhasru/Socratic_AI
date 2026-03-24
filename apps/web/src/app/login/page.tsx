'use client';

import AuthContainer from "@/components/AuthContainer";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <AuthContainer />
    </Suspense>
  );
}
