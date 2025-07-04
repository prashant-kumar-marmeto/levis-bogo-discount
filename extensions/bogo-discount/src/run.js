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
  // const configuration = JSON.parse(
  //   input?.discountNode?.metafield?.value ?? "{}"
  // );
  const customer = input.cart.buyerIdentity?.customer;
  const customerEmail = customer?.email || "";
  if (customerEmail.endsWith('@levi.com')){
    return EMPTY_DISCOUNT
  } else {
  const discounts = [];
  const linesWithTag = [];

  input.cart.lines.forEach((line) => {
    if (
      line.merchandise.__typename === "ProductVariant" &&
      line.merchandise.product.hasAnyTag === true
    ) {
      linesWithTag.push({
        id: line.merchandise.id,
        quantity: line.quantity,
        cost:
          line.cost.compareAtAmountPerQuantity?.amount ||
          line.cost.amountPerQuantity.amount,
      });
    }
  });

  // Calculate total quantity of all items with the "bogo" tag
  const totalQuantity = linesWithTag.reduce(
    (acc, line) => acc + line.quantity,
    0
  );

  linesWithTag.sort((a, b) => a.cost - b.cost);

  if (totalQuantity >= 2) {
    let remainingFreeItems = Math.floor(totalQuantity / 2);

    // Distribute the free items among the products
    const targets = [];

    for (let line of linesWithTag) {
      if (remainingFreeItems <= 0) break;

      const freeItemsForLine = Math.min(line.quantity, remainingFreeItems);
      targets.push({
        productVariant: {
          id: line.id,
          quantity: freeItemsForLine,
        },
      });
      remainingFreeItems -= freeItemsForLine;
    }

    discounts.push({
      targets: targets,
      value: {
        percentage: {
          value: 99.99,
        },
      },
      message: "BUY1GET1",
    });
  }

  console.log(JSON.stringify(discounts, null, 20));
  console.log(customerEmail)

  return discounts.length > 0
    ? {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        discounts: discounts,
      }
    : EMPTY_DISCOUNT;
  }
}
