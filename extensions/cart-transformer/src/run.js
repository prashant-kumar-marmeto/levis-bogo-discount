// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const customer = input.cart.buyerIdentity?.customer;
  const customerEmail = customer?.email || "";
  if (customerEmail.endsWith('@levi.com')){
    return {
      operations: [],
    };
  }
  const linesWithTag = [];
  const operations = [];

  input.cart.lines.forEach((line) => {
    if (
      line.merchandise.__typename === "ProductVariant" &&
      line.merchandise.product.hasAnyTag === true
    ) {
      linesWithTag.push({
        cartLineId: line.id,
        id: line.merchandise.id,
        quantity: line.quantity,
        cost:
          line.cost.compareAtAmountPerQuantity?.amount ||
          line.cost.amountPerQuantity.amount,
      });
    }
  });

  // Calculate total quantity of all items with the "bxgy" tag
  const totalQuantity = linesWithTag.reduce(
    (acc, line) => acc + line.quantity,
    0
  );

  linesWithTag.sort((a, b) => a.cost - b.cost);
  if (totalQuantity >= 2) {

    linesWithTag.forEach((line) => {
      operations.push({
        update: {
          cartLineId: line.cartLineId,
          price: {
            adjustment: {
              fixedPricePerUnit: {
                amount: line.cost,
              },
            },
          },
        },
      });
    });
  }

  console.log("***", JSON.stringify(operations, null, 20));
  console.log(customerEmail)

  return operations.length > 0 ? { operations: operations } : NO_CHANGES;
}
