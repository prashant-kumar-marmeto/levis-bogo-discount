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

  // if (totalQuantity >= 2) {
  //   linesWithTag.forEach((lineItem) => {
  //     operations.push({
  //       update: {
  //         cartLineId: lineItem.cartLineId,
  //         price: {
  //           adjustment: {
  //             fixedPricePerUnit: {
  //               amount: lineItem.cost,
  //             },
  //           },
  //         },
  //       },
  //     });
  //   });
  // }

  // if (totalQuantity >= 2) {
  //   let remainingFreeItems = Math.floor(totalQuantity / 2);

  //   for (let line of linesWithTag) {
  //     if (remainingFreeItems <= 0) break;
  
  //     const freeItemsForLine = Math.min(line.quantity, remainingFreeItems);

  //     operations.push({
  //       update: {
  //         cartLineId: line.cartLineId,
  //         price: {
  //           adjustment: {
  //             fixedPricePerUnit: {
  //               amount: line.cost,
  //             },
  //           },
  //         },
  //       },
  //     });
  
  //     remainingFreeItems -= freeItemsForLine;
  //   }
  // }
  
  if (totalQuantity >= 2) {
    // let remainingFreeItems = Math.floor(totalQuantity / 2);
    // let remainingPairs = remainingFreeItems;
    
    // for (let line of linesWithTag) {
    //   if (remainingPairs <= 0) break;
      
    //   const pairableItems = Math.min(line.quantity, remainingPairs * 2);
      
    //   for (let i = 0; i < pairableItems / 2; i++) {
    //     if (remainingPairs <= 0) break;
        
    //     operations.push({
    //       update: {
    //         cartLineId: line.cartLineId,
    //         price: {
    //           adjustment: {
    //             fixedPricePerUnit: {
    //               amount: line.cost,
    //             },
    //           },
    //         },
    //       },
    //     });
        
    //     remainingPairs--;
    //   }
    // }
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

  return operations.length > 0 ? { operations: operations } : NO_CHANGES;
}
