import { RawPaymentData } from "./types";

export const sanitizePaymentData = (
  paymentData: RawPaymentData,
): RawPaymentData => {
  const copy: RawPaymentData = {
    ...(paymentData ?? {}),
  };

  if (typeof copy.amount === "string") {
    const parsed = Number(copy.amount);

    if (!Number.isNaN(parsed)) {
      copy.amount = parsed;
    }
  }

  //   ----------------------
  // SI HAY DESCUENTOS -JUL-26 NO UTILIZADO -
  // ----------------------

  copy.resource = Array.isArray(copy.resource)
    ? copy.resource.filter((resource) => {
        return (
          resource &&
          (resource.id || "") &&
          (resource.resource_name || "") &&
          Number(
            resource.resource_discount ?? resource.resource_discount ?? 0,
          ) > 0 &&
          Number(resource.resource_quanity ?? resource.resource_quanity ?? 0) >
            0
        );
      })
    : [];

  //   ----------------------
  // SI HAY REDEMPTIONS -JUL-26 NO UTILIZADO -
  // ----------------------

  copy.redemptions = Array.isArray(copy.redemptions)
    ? copy.redemptions.filter(
        (redemption) => redemption && redemption.id && redemption.type,
      )
    : [];
  //   ----------------------
  // SI HAY USER_RESOURCES -JUL-26 NO UTILIZADO -
  // ----------------------

  copy.user_resources = Array.isArray(copy.user_resources)
    ? copy.user_resources.filter((userResource) => {
        const hasResource = !!userResource.resource;

        const discount = Number(
          userResource.resource?.discount ??
            userResource.resource?.resource_discount ??
            0,
        );

        const available =
          Number(userResource.quantity ?? 0) -
          Number(userResource.quantity_redeemed ?? 0);

        return hasResource && discount > 0 && available > 0;
      })
    : [];

  return copy;
};
