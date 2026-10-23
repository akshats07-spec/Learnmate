import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPlan, PlanId } from "@/lib/plans";

export const runtime = "nodejs";

const Body = z.object({
  planId: z.enum(["starter", "pro", "ultra"]),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const { planId, billingCycle } = parsed.data;
    const plan = getPlan(planId as PlanId);
    const amountInr = billingCycle === "annual" ? plan.priceAnnual * 12 : plan.priceMonthly;
    const amountPaise = amountInr * 100;

    // Check if Razorpay keys are configured
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      // Clean provider abstraction: Sandbox / Demo mode
      return NextResponse.json({
        mode: "sandbox",
        message: "Razorpay credentials not yet configured in environment variables. Demonstrating sandbox payment session.",
        orderId: `order_sandbox_${Date.now()}`,
        amount: amountPaise,
        currency: "INR",
        plan: plan.name,
        key: "rzp_test_placeholder",
      });
    }

    // Live Razorpay order creation via basic auth
    const authHeader = `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`;
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `receipt_${planId}_${Date.now()}`,
        notes: { planId, billingCycle },
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderData.error?.description || "Razorpay order creation failed.");
    }

    return NextResponse.json({
      mode: "live",
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      plan: plan.name,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || razorpayKeyId,
    });
  } catch (error: any) {
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment." }, { status: 500 });
  }
}
