type CanRefundParams = {
  is_refundable: boolean;
  refund_days_limit?: number;
  event_date?: string | Date;
  user_attended?: boolean;
  end_sale_date?: string | Date;
};

export const canRefundTicket = ({
  is_refundable,
  refund_days_limit,
  event_date,
  user_attended,
  end_sale_date,
}: CanRefundParams): boolean => {
  if (!is_refundable) return false;
  if (user_attended) return false;
  if (!event_date || !refund_days_limit) return false;

  const now = new Date();
  const eventDate = new Date(event_date);

  // Evento ya finalizado
  if (eventDate < now) return false;

  // Fecha límite de reembolso
  const refundLimitDate = new Date(eventDate);
  refundLimitDate.setDate(eventDate.getDate() - refund_days_limit);

  return now < refundLimitDate;
};
