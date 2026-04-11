"use client";

import { useActionState, useState } from "react";
import { processTopupAction } from "./topupAction";

const inputCls =
  "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const buttonCls =
  "px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition";
const selectedButtonCls =
  "px-3 py-2 rounded-md bg-indigo-600 dark:bg-indigo-700 text-sm font-medium text-white transition";

export default function TopupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [step, setStep] = useState<"amount" | "payment">("amount");
  const [result, action, pending] = useActionState(
    async (...args: Parameters<typeof processTopupAction>) => {
      const res = await processTopupAction(...args);
      if (res.ok) {
        setSelectedAmount(null);
        setCustomAmount("");
        setStep("amount");
        onClose();
      }
      return res;
    },
    null,
  );

  const predefinedAmounts = [50, 100, 250, 500];
  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : null);

  const handleAmountNext = () => {
    if (finalAmount) {
      setStep("payment");
    }
  };

  const handlePaymentBack = () => {
    setStep("amount");
  };

  return (
    <>
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-2xl dark:shadow-2xl max-h-[90vh] overflow-y-auto">
            {step === "amount" ? (
              <>
                <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                  טעינת חשבון
                </h2>

                <div className="space-y-4">
                  {/* Amount Selection */}
                  <div>
                    <label className={labelCls + " mb-3 block"}>בחר סכום</label>

                    {/* Predefined amounts */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount("");
                          }}
                          className={
                            selectedAmount === amount ? selectedButtonCls : buttonCls
                          }
                        >
                          ₪{amount}
                        </button>
                      ))}
                    </div>

                    {/* Custom amount */}
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="סכום אחר"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className={inputCls}
                    />

                    {finalAmount && (
                      <p className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        סה"כ: ₪{typeof finalAmount === "number" ? finalAmount.toFixed(2) : "0.00"}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      ביטול
                    </button>
                    <button
                      type="button"
                      onClick={handleAmountNext}
                      disabled={!finalAmount}
                      className="flex-1 rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition"
                    >
                      המשך לתשלום
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <form action={action} className="space-y-4">
                <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                  פרטי תשלום
                </h2>

                {result && !result.ok && (
                  <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {result.message}
                  </p>
                )}

                {/* Amount Display */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-4">
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">סכום לתשלום</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">
                    ₪{typeof finalAmount === "number" ? finalAmount.toFixed(2) : "0.00"}
                  </p>
                </div>

                {/* Card Fields */}
                <div>
                  <label className={labelCls}>מספר כרטיס</label>
                  <input
                    name="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>תאריך תפוגה</label>
                    <input
                      name="expiry"
                      type="text"
                      placeholder="MM/YY"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>CVV</label>
                    <input
                      name="cvv"
                      type="text"
                      placeholder="123"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Hidden input for amount */}
                <input
                  type="hidden"
                  name="amount"
                  value={finalAmount || ""}
                />

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handlePaymentBack}
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition"
                  >
                    {pending ? "מעבד…" : "אישור תשלום"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}
