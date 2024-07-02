mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
  discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
    automaticAppDiscount {
      discountId
      appDiscountType {
        appBridge {
          detailsPath
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}

{
  "automaticAppDiscount": {
    "title": "BUY1GET1",
    "functionId": "e6b6aab4-d8d7-4553-9eb5-030abb075df0",
    "startsAt": "2024-07-02T06:17:36.963Z",
    "endsAt": null,
    "metafields": {
      "namespace": "$app:bxgy-discount",
      "key": "function-configuration",
      "type":"json",
      "value": "{\"selectedProductTags\":[\"Prebuzz EOSS\"]}"
    }
  }
}