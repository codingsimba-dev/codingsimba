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
import { logSystemEvent, SystemAction } from "./system.server";

const { POLAR_ACCESS_TOKEN, NODE_ENV, POLAR_ORGANIZATION_ID } = process.env;

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

/**
 * Retrieves details of a specific checkout session by ID
 *
 * This function fetches the current status and details of a checkout session
 * that was previously created. This is useful for checking payment status,
 * retrieving session metadata, or handling post-payment processing.
 *
 * @example
 * ```typescript
 * const session = await getCheckoutSession("checkout_123");
 *
 * if (session.status === "completed") {
 *   // Process successful payment
 *   await processSuccessfulPayment(session);
 * }
 * ```
 *
 * @param {string} checkoutId - The unique identifier of the checkout session
 * @returns {Promise<Object>} Checkout session object with status, payment details, and metadata
 * @throws {Error} If checkout session is not found or Polar API request fails
 */
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
    organizationId: POLAR_ORGANIZATION_ID,
  });
}

/**
 * Creates a customer session for accessing the customer portal
 *
 * This function generates a secure session that allows customers to access
 * their subscription management portal. The session provides authenticated
 * access to billing information, subscription management, and payment history.
 *
 * @example
 * ```typescript
 * const session = await createCustomerSession("customer_123");
 *
 * // Redirect customer to portal with session
 * window.location.href = session.url;
 * ```
 *
 * @param {string} customerId - The unique identifier of the customer
 * @returns {Promise<Object>} Customer session object containing portal URL and session details
 * @throws {Error} If customer is not found or Polar API request fails
 */
export async function createCustomerSession(customerId: string) {
  return polar.customerSessions.create({
    externalCustomerId: customerId,
    // customerId,
  });
}

/**
 * Retrieves customer information by external customer ID
 *
 * This function fetches detailed customer information including subscription
 * status, billing details, and account metadata. The customer ID should match
 * the external ID used when creating the customer in Polar.
 *
 * @example
 * ```typescript
 * const customer = await getCustomer("user_123");
 *
 * console.log(`Customer: ${customer.name}`);
 * console.log(`Email: ${customer.email}`);
 * console.log(`Active subscriptions: ${customer.subscriptions?.length || 0}`);
 * ```
 *
 * @param {string} customerId - The external customer identifier (usually user ID)
 * @returns {Promise<Object>} Customer object with profile, subscription, and billing information
 * @throws {Error} If customer is not found or Polar API request fails
 */
export async function getCustomer(customerId: string) {
  return polar.customers.getExternal({ externalId: customerId });
}

/**
 * Deletes a customer and all associated data from Polar
 *
 * This function permanently removes a customer from the Polar system,
 * including their subscription history, billing information, and account
 * metadata. This action is irreversible and should be used with caution.
 *
 * @example
 * ```typescript
 * // Ensure customer has no active subscriptions before deletion
 * const customer = await getCustomer("user_123");
 * if (customer.subscriptions?.length === 0) {
 *   await deleteCustomer("user_123");
 *   console.log("Customer deleted successfully");
 * }
 * ```
 *
 * @param {string} customerId - The external customer identifier to delete
 * @returns {Promise<Object>} Deletion confirmation object
 * @throws {Error} If customer has active subscriptions or Polar API request fails
 */
export async function deleteCustomer(customerId: string) {
  return polar.customers.deleteExternal({ externalId: customerId });
}

/**
 * Retrieves detailed information about a specific subscription
 *
 * This function fetches comprehensive subscription details including status,
 * billing cycle, payment history, and associated customer information.
 * Useful for subscription management and status verification.
 *
 * @example
 * ```typescript
 * const subscription = await getSubscription("sub_123");
 *
 * console.log(`Status: ${subscription.status}`);
 * console.log(`Plan: ${subscription.product.name}`);
 * console.log(`Next billing: ${subscription.currentPeriodEnd}`);
 * ```
 *
 * @param {string} subscriptionId - The unique identifier of the subscription
 * @returns {Promise<Object>} Subscription object with status, billing, and product details
 * @throws {Error} If subscription is not found or Polar API request fails
 */
export async function getSubscription(subscriptionId: string) {
  return polar.subscriptions.get({ id: subscriptionId });
}
/**
 * Cancels a subscription and stops future billing
 *
 * This function immediately cancels a subscription, preventing any future
 * charges. The subscription will remain active until the end of the current
 * billing period, after which it will be terminated.
 *
 * @example
 * ```typescript
 * // Cancel subscription and log the action
 * await cancelSubscription("sub_123");
 *
 * await logSubscriptionEvent({
 *   action: SystemAction.SUBSCRIPTION_CANCELLED,
 *   subscriptionId: "sub_123",
 *   plan: "premium_monthly"
 * });
 * ```
 *
 * @param {string} subscriptionId - The unique identifier of the subscription to cancel
 * @returns {Promise<Object>} Cancellation confirmation object with updated subscription status
 * @throws {Error} If subscription is not found, already cancelled, or Polar API request fails
 */
export async function cancelSubscription(subscriptionId: string) {
  return polar.subscriptions.revoke({ id: subscriptionId });
}

/**
 * Logs subscription events to the database
 */
export async function logSubscriptionEvent({
  action,
  subscriptionId,
  plan,
  status,
  metadata,
  ipAddress,
  userAgent,
}: {
  action: SystemAction;
  subscriptionId: string;
  plan?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await logSystemEvent({
    action,
    description: `Subscription ${action.toLowerCase().replace("_", " ")}`,
    severity: "INFO",
    metadata: {
      subscriptionId,
      plan,
      status,
      ...metadata,
    },
    ipAddress,
    userAgent,
  });
}
