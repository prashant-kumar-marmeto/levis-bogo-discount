// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const customer = input.cart.buyerIdentity?.customer;
  const customerEmail = customer?.email || "";

  if (customerEmail.endsWith("@levi.com")) {
    return EMPTY_DISCOUNT;
  }

  const eligibleLines = [];
  
  input.cart.lines.forEach((line) => {
    if (
      line.merchandise.__typename === "ProductVariant" &&
      line.merchandise.product.hasAnyTag === true
    ) {
      eligibleLines.push({
        id: line.merchandise.id,
        quantity: line.quantity,
      });
    }
  });

  // Calculate total eligible quantity
  const totalEligibleQty = eligibleLines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );
  
  // Only apply discount if quantity is 2 or more (no need for pairs)
  if (totalEligibleQty < 2) {
    return EMPTY_DISCOUNT;
  }
  
  const discounts = eligibleLines.map((line) => ({
    targets: [
      {
        productVariant: {
          id: line.id,
          quantity: line.quantity,
        },
      },
    ],
    value: {
      percentage: {
        value: 50.0,
      },
    },
    message: "Buy 2 Get 50% Off",
  }));

  return discounts.length > 0
    ? {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        discounts,
      }
    : EMPTY_DISCOUNT;
}
