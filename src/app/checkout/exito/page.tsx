import { Suspense } from "react";
import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-[#8a7b6e]">Cargando...</p>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
