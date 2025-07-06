/**
 * @fileoverview Polar payment integration for handling subscriptions and payments
 *
 * This module provides a centralized configuration for the Polar SDK, which is used
 * for managing subscription payments, customer portals, and payment processing
 * throughout the application.
 *
 * Polar is a platform that helps creators monetize their content through
 * subscriptions, one-time payments, and other monetization features.
 *
 * @see {@link https://polar.sh/docs/api} Polar API Documentation
 * @see {@link https://github.com/polarsource/polar-js} Polar JavaScript SDK
 */

import { Polar } from "@polar-sh/sdk";

const { POLAR_ACCESS_TOKEN, NODE_ENV } = process.env;
const ORGANIZATION_ID = "ae1bc13f-e313-4066-87dc-dabcd7314261";

/**
 * Polar SDK instance configured with environment-based access token
 *
 * This instance is used throughout the application for:
 * - Processing subscription payments
 * - Managing customer portals
 * - Handling webhook events from Polar
 * - Creating checkout sessions
 * - Managing subscription status
 *
 * @example
 * ```typescript
 * // Create a checkout session
 * const session = await polar.checkouts.create({
 *   externalCustomerId: "user_123",
 *   products: ["prod_456"],
 *   successUrl: "https://example.com/success",
 * });
 *
 * // Get customer portal URL
 * const portal = await polar.customerPortals.create({
 *   externalCustomerId: "user_123",
 *   returnUrl: "https://example.com/return"
 * });
 * ```
 *
 * @requires POLAR_ACCESS_TOKEN - Environment variable containing the Polar API access token
 * @throws {Error} If POLAR_ACCESS_TOKEN is not configured in environment variables
 */
export const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: NODE_ENV === "development" ? "sandbox" : "production",
});

/**
 * Creates a new checkout session for subscription or one-time payments
 *
 * This function initiates a payment flow by creating a checkout session with Polar.
 * The session will redirect users to complete their payment and then return to
 * the specified success URL.
 *
 * @example
 * ```typescript
 * const session = await createCheckoutSession({
 *   userId: "user_123",
 *   products: ["premium_subscription", "one_time_course"],
 *   successUrl: "https://myapp.com/subscription"
 * });
 *
 * // Redirect user to session.url to complete payment
 * window.location.href = session.url;
 * ```
 *
 * @param {Object} params - The checkout session parameters
 * @param {string} params.userId - The unique identifier for the customer (usually user ID)
 * @param {string[]} params.products - Array of product IDs to purchase
 * @param {string} params.successUrl - Base URL to redirect to after successful payment
 * @returns {Promise<Object>} Checkout session object containing payment URL and session details
 * @throws {Error} If Polar API request fails or required parameters are missing
 */
export async function createCheckoutSession({
  userId,
  teamId,
  products,
  successUrl,
  discountId,
  customerEmail,
  customerName,
  isBusinessCustomer,
}: {
  userId?: string;
  teamId?: string;
  products: string[];
  successUrl: string;
  discountId?: string;
  customerEmail: string;
  customerName: string;
  isBusinessCustomer: boolean;
}) {
  return polar.checkouts.create({
    products,
    successUrl,
    customerEmail,
    customerName,
    isBusinessCustomer,
    externalCustomerId: userId ?? teamId,
    allowDiscountCodes: true,
    discountId,
    metadata: {
      ...(userId && { userId }),
      ...(teamId && { teamId }),
    },
  });
}

export async function getCheckoutSession(checkoutId: string) {
  return polar.checkouts.get({ id: checkoutId });
}

/**
 * Retrieves a list of available products from Polar
 *
 * This function fetches the catalog of products that can be purchased through
 * the Polar integration. Products may include subscriptions, one-time purchases,
 * or other monetization offerings.
 *
 * @example
 * ```typescript
 * const products = await listProducts();
 *
 * products.data.forEach(product => {
 *   console.log(`${product.name}: ${product.price}`);
 * });
 * ```
 *
 * @returns {Promise<Object>} Object containing array of products with pricing and metadata
 * @throws {Error} If Polar API request fails or access token is invalid
 */
export async function listProducts() {
  return polar.products.list({
    limit: 6,
    isArchived: false,
    organizationId: ORGANIZATION_ID,
  });
}

export async function createCustomerSession(customerId: string) {
  return polar.customerSessions.create({
    customerId,
  });
}

export async function getCustomer(customerId: string) {
  return polar.customers.getExternal({ externalId: customerId });
}

export async function deleteCustomer(customerId: string) {
  return polar.customers.deleteExternal({ externalId: customerId });
}

export async function getSubscription(subscriptionId: string) {
  return polar.subscriptions.get({ id: subscriptionId });
}
export async function cancelSubscription(subscriptionId: string) {
  return polar.subscriptions.revoke({ id: subscriptionId });
}
