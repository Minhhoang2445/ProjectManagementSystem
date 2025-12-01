import { LoginForm } from "@/components/login-form"
import { useSearchParams } from "react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const toastShown = useRef(false);

  useEffect(() => {
    if (reason === "suspended" && !toastShown.current) {
      toast.error("Tài khoản của bạn đã bị tạm khóa.");
      toastShown.current = true;
    }
  }, [reason]);
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
