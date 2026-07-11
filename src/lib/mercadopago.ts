import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getBaseUrl } from "./config";
import type { CartItem } from "./whatsapp";

function getClient() {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export function isMercadoPagoEnabled() {
  return Boolean(process.env.MP_ACCESS_TOKEN?.trim());
}

export async function createCheckoutPreference(
  items: CartItem[],
  options?: { orderId?: string; orderCode?: string }
) {
  const client = getClient();
  if (!client) {
    throw new Error("Mercado Pago no está configurado");
  }

  const baseUrl = getBaseUrl();
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS",
      })),
      external_reference: options?.orderId || undefined,
      statement_descriptor: options?.orderCode?.slice(0, 22) || "ETERNITY",
      back_urls: {
        success: `${baseUrl}/checkout/exito`,
        failure: `${baseUrl}/checkout/error`,
        pending: `${baseUrl}/checkout/pendiente`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      metadata: {
        order_id: options?.orderId || "",
        order_code: options?.orderCode || "",
      },
    },
  });

  return {
    id: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
  };
}

export async function getPaymentById(paymentId: string) {
  const client = getClient();
  if (!client) throw new Error("Mercado Pago no está configurado");
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
