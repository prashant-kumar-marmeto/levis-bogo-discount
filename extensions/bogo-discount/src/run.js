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
      const price = parseFloat(line.cost.amountPerQuantity.amount);
      const compareAt = parseFloat(
        line.cost.compareAtAmountPerQuantity?.amount || price
      );
      const discountPercent = ((compareAt - price) / compareAt) * 100;

      // Skip if already discounted 50% or more
      if (discountPercent >= 50) return;

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

  // Only apply discount to items in pairs (2, 4, 6...)
  let discountQtyRemaining = Math.floor(totalEligibleQty / 2) * 2;

  const discounts = [];

  for (const line of eligibleLines) {
    if (discountQtyRemaining <= 0) break;

    const discountQty = Math.min(line.quantity, discountQtyRemaining);

    discounts.push({
      targets: [
        {
          productVariant: {
            id: line.id,
            quantity: discountQty,
          },
        },
      ],
      value: {
        percentage: {
          value: 50.0,
        },
      },
      message: "Buy 2 Get 50% Off",
    });

    discountQtyRemaining -= discountQty;
  }

  return discounts.length > 0
    ? {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        discounts,
      }
    : EMPTY_DISCOUNT;
}
