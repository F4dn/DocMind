"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function useAuthGuard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  return authChecked;
}

export function logout(router: ReturnType<typeof useRouter>) {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  router.push("/login");
}
