import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cartService } from "@/modules/cart";
import CartSummary from "./CartSummary";

export const metadata = {
  title: "Cart",
};

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cartData = await cartService.getCartSummary(session.user.id);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px" }}>
        סל קניות
      </h1>

      {cartData.itemCount === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            סל הקניות שלך ריק
          </p>
        </div>
      ) : (
        <CartSummary cartData={cartData} />
      )}
    </div>
  );
}
