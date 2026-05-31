"use client";

import { Suspense } from "react";
import SetPasswordForm from "@/components/SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}