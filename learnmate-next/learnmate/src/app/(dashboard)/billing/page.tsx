"use client";
import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PLANS, formatPrice, PlanId } from "@/lib/plans";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("pro");
  const [cancelling, setCancelling] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const activePlanObj = PLANS.find((p) => p.id === currentPlan) || PLANS[2];

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === currentPlan) return;
    setLoadingPlan(planId);
    setStatusNotice(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle: "monthly" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.mode === "sandbox") {
        setCurrentPlan(planId);
        setStatusNotice(
          `Sandbox active: Switched to ${planId.toUpperCase()} plan! (Add RAZORPAY_KEY_ID in .env.local to open the live UPI/PhonePe gateway modal)`
        );
      } else {
        // Dynamically load Razorpay standard checkout script
        const loadScript = () =>
          new Promise((resolve) => {
            if ((window as any).Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const loaded = await loadScript();
        if (!loaded) {
          setStatusNotice("Failed to load Razorpay payment gateway. Please check your internet connection.");
          return;
        }

        const rzp = new (window as any).Razorpay({
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "LearnMate AI",
          description: `${data.plan} Tier Subscription`,
          order_id: data.orderId,
          handler: function (response: any) {
            setCurrentPlan(planId);
            setStatusNotice(
              `Payment successful via Razorpay! Payment ID: ${response.razorpay_payment_id}. Your ${planId.toUpperCase()} tier is now active.`
            );
          },
          prefill: {
            name: "Alex Sharma",
            email: "alex@university.edu",
          },
          theme: {
            color: "#7c3aed",
          },
        });

        rzp.open();
      }
    } catch (err: any) {
      setStatusNotice(err.message || "Checkout could not be completed.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = () => {
    setCurrentPlan("free");
    setCancelling(false);
    setStatusNotice("Your subscription has been cancelled. You will retain access until the end of the billing cycle.");
  };

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
            Account & Subscriptions
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-mint" />
          <span className="text-2xs text-muted">Razorpay INR Billing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Subscription & Usage Entitlements
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your plan, check your monthly limits, and download invoices.
        </p>
      </div>

      {statusNotice && (
        <div className="p-4 rounded-xl bg-violet-dim/20 border border-violet/30 text-violet-bright text-xs flex items-center gap-2">
          <Sparkles size={16} />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* ── Active Plan & Quotas ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Subscription Card */}
        <Card className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
                Active Subscription
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">{activePlanObj.name} Plan</h2>
              <span className="text-xs text-muted">{activePlanObj.tagline}</span>
            </div>
            <Badge variant="mint">Active</Badge>
          </div>

          <div className="flex items-baseline gap-1.5 pt-2">
            <span className="text-3xl font-extrabold text-white">
              {formatPrice(activePlanObj.priceMonthly)}
            </span>
            <span className="text-xs text-muted">/ month (Billed via Razorpay)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line text-xs text-muted flex items-center justify-between">
            <span>Next renewal date:</span>
            <strong className="text-white font-mono">November 23, 2026</strong>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {currentPlan !== "free" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelling(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </Card>

        {/* Right: Monthly Quota Meters */}
        <Card className="lg:col-span-6 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Monthly Quota Utilization
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Document Uploads</span>
                <span className="font-mono text-muted">2 / 50 used</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5">
                <div className="bg-violet h-1.5 rounded-full" style={{ width: "4%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">AI Tutor Questions</span>
                <span className="font-mono text-muted">14 / 500 used</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5">
                <div className="bg-mint h-1.5 rounded-full" style={{ width: "3%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">3D Visual Generations</span>
                <span className="font-mono text-muted">3 / 50 used</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: "6%" }} />
              </div>
            </div>
          </div>

          <div className="pt-2 text-2xs text-muted flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-mint" />
            <span>Usage resets on the 1st of every month.</span>
          </div>
        </Card>
      </div>

      {/* ── Switch Plan Cards ─────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Available Subscription Plans
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.filter((p) => p.id !== "free").map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isPro = plan.id === "pro";

            return (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col justify-between transition-all ${
                  isCurrent ? "border-2 border-violet shadow-glow" : "border-line"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                    {isCurrent && <Badge variant="violet">Current Plan</Badge>}
                    {isPro && !isCurrent && <Badge variant="mint">Popular</Badge>}
                  </div>

                  <p className="text-xs text-muted mb-4">{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-white">
                      {formatPrice(plan.priceMonthly)}
                    </span>
                    <span className="text-2xs text-muted">/ month</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    {plan.features.slice(0, 5).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-mint shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isCurrent ? "outline" : "primary"}
                  disabled={isCurrent || loadingPlan === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className="w-full text-xs"
                >
                  {isCurrent
                    ? "Current Active Plan"
                    : loadingPlan === plan.id
                    ? "Processing..."
                    : `Switch to ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-panel border border-line space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Cancel your subscription?</h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure? You will lose access to priority AI processing and monthly 3D visual generation quotas at the end of your billing cycle.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setCancelling(false)} className="flex-1">
                Keep Subscription
              </Button>
              <Button variant="danger" onClick={handleCancelSubscription} className="flex-1">
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
