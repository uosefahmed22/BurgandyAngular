export interface CreateReservationDto {
  productId: number;
  customerName: string;
  customerPhone: string;
  size: string;
  color: string;
  notes?: string;
}

export interface Reservation {
  id: number;
  code: string;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  productPrice: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  size: string;
  color: string;
  notes: string | null;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  depositAmount: number | null;
  expiresAt: string | null;
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

export interface TrackReservationParams {
  code: string;
  phone: string;
}
