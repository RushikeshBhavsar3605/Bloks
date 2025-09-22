import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { plans } from "@/data/pricing";
import { db } from "@/lib/db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecretEnv = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey || !webhookSecretEnv) {
  throw new Error("Stripe environment variables are not set");
}

const stripe = new Stripe(stripeSecretKey);
const webhookSecret = webhookSecretEnv;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).send("Missing or invalid Stripe signature");
  }

  let event;

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).json({ error: err.message });
  }

  const data = event.data;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = await stripe.checkout.sessions.retrieve(
          (data.object as any).id,
          {
            expand: ["line_items"],
          }
        );

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (!customerId) {
          console.error("Customer ID is missing from session");
          break;
        }
        const customer = await stripe.customers.retrieve(customerId);

        const priceId = session.line_items?.data[0].price?.id;
        const plan = plans.find(
          (p) => p.priceId.monthly === priceId || p.priceId.yearly === priceId
        );

        if (!plan) break;

        if (customer.deleted) {
          console.log("Customer is deleted");
          throw new Error("Customer was deleted");
        }

        const user = await db.user.findUnique({
          where: {
            email: customer.email as string,
          },
          select: {
            id: true,
          },
        });

        if (customer.id && customer.email && user) {
          const subscription = await db.subscription.findUnique({
            where: {
              stripeCustomerId: customer.id,
            },
          });

          if (subscription) {
            await db.subscription.update({
              where: {
                stripeCustomerId: customer.id,
              },
              data: {
                priceId: priceId,
                hasAccess: true,
                plan: plan.id,
              },
            });
          } else {
            await db.subscription.create({
              data: {
                userId: user.id,
                stripeCustomerId: customer.id,
                plan: plan.id,
                hasAccess: true,
                priceId: priceId as string,
              },
            });

            await db.user.update({
              where: {
                id: user.id,
              },
              data: {
                stripeCustomerId: customer.id,
              },
            });
          }
        } else {
          console.log("Not found");
          throw new Error("No user found");
        }

        // Extra: >>>>> send email to dash <<<<<

        break;
      }
      case "customer.subscription.deleted": {
        const subscription = data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
          console.error("Customer ID is missing from subscription");
          break;
        }

        // Update subscription to revoke access
        const existingSubscription = await db.subscription.findUnique({
          where: {
            stripeCustomerId: customerId,
          },
        });

        if (existingSubscription) {
          await db.subscription.update({
            where: {
              stripeCustomerId: customerId,
            },
            data: {
              hasAccess: false,
            },
          });
        } else {
          console.log("No subscription found for customer:", customerId);
        }

        break;
      }
      case "customer.subscription.updated": {
        const subscription = data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
          console.error("Customer ID is missing from subscription");
          break;
        }

        // Find existing subscription in database
        const existingSubscription = await db.subscription.findUnique({
          where: {
            stripeCustomerId: customerId,
          },
        });

        if (!existingSubscription) {
          console.log("No subscription found for customer:", customerId);
          break;
        }

        // Determine access based on subscription status
        const activeStatuses = ["active"];
        const hasAccess = activeStatuses.includes(subscription.status);

        if (hasAccess) {
          // Plan upgrade case - update priceId and plan name
          const newPriceId = subscription.items.data[0]?.price?.id;

          if (newPriceId) {
            const plan = plans.find(
              (p) =>
                p.priceId.monthly === newPriceId ||
                p.priceId.yearly === newPriceId
            );

            await db.subscription.update({
              where: {
                stripeCustomerId: customerId,
              },
              data: {
                hasAccess: true,
                priceId: newPriceId,
                plan: plan ? plan.id : existingSubscription.plan, // Keep existing plan name if not found
              },
            });
          } else {
            // Just update access without changing price/plan
            await db.subscription.update({
              where: {
                stripeCustomerId: customerId,
              },
              data: {
                hasAccess: true,
              },
            });
          }
        } else {
          // Plan expired/canceled - revoke access but keep existing priceId/plan
          await db.subscription.update({
            where: {
              stripeCustomerId: customerId,
            },
            data: {
              hasAccess: false,
            },
          });
        }

        break;
      }
      default: {
        break;
      }
    }
  } catch (error: any) {
    console.error(
      "Stripe error: " + error.message + " | EVENT TYPE: " + eventType
    );
  }

  return res.status(200).json({ received: true });
}
