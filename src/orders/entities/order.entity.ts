export class Order {
  orderId: string;
  userId: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  deliveryCharges: number;
  paymentMethod: string;
  pickupDate: FirebaseFirestore.Timestamp;
  pickupTime: string;
  address: string;
  createdAt: FirebaseFirestore.Timestamp;
  orderItems: OrderItem[]; // ✅ Nested Order Items
}

export class OrderItem {
  itemId: string;
  serviceId: string;
  quantity: number;
  price: number;
}
