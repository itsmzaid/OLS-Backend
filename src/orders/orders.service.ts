import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  private firestore = firebaseAdmin.firestore();
  private ordersCollection;

  constructor() {
    this.ordersCollection = this.firestore.collection('orders');
  }

  /**
   * ✅ Create an order with userId
   */
  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    try {
      const {
        orderItems,
        pickupDate,
        pickupTime,
        address,
        paymentMethod,
        userEmail,
        userName,
        userPhoneNo,
      } = createOrderDto;

      if (!userId) {
        throw new ForbiddenException('User ID is required to place an order.');
      }

      // Calculate total amount
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const deliveryCharges = 150;
      const finalAmount = totalAmount + deliveryCharges;

      // Generate a new order document
      const newOrderRef = this.ordersCollection.doc();

      // Convert DTO to plain object
      const plainOrderItems = orderItems.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
      }));

      await newOrderRef.set({
        userId, // ✅ Ensure userId is stored
        userEmail,
        userName,
        userPhoneNo,
        status: 'Pending',
        totalAmount: finalAmount,
        deliveryCharges,
        paymentMethod,
        pickupDate,
        pickupTime,
        address,
        orderItems: plainOrderItems, // ✅ Store plain object array
        createdAt: new Date(),
      });

      return { message: 'Order created successfully', orderId: newOrderRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * ✅ Get all orders for a specific user
   */
  async getUserOrders(userId: string) {
    try {
      const snapshot = await this.ordersCollection
        .where('userId', '==', userId)
        .get();

      if (snapshot.empty) {
        throw new NotFoundException('No orders found for this user');
      }

      return snapshot.docs.map((doc) => ({ orderId: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  /**
   * ✅ Get a specific order by ID
   */
  async getOrderById(userId: string, orderId: string) {
    try {
      const orderDoc = await this.ordersCollection.doc(orderId).get();

      if (!orderDoc.exists) {
        throw new NotFoundException('Order not found');
      }

      const orderData = orderDoc.data();
      if (orderData.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to view this order',
        );
      }

      return { orderId, ...orderData };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  /**
   * ✅ Update order details (only if it belongs to the user)
   */
  async updateOrder(
    userId: string,
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ) {
    try {
      const orderDoc = this.ordersCollection.doc(orderId);
      const orderSnapshot = await orderDoc.get();

      if (!orderSnapshot.exists) {
        throw new NotFoundException('Order not found');
      }

      const orderData = orderSnapshot.data();
      if (orderData.userId !== userId) {
        throw new ForbiddenException('You cannot update this order');
      }

      await orderDoc.update(updateOrderDto);
      return { message: 'Order updated successfully' };
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  /**
   * ✅ Delete an order (only if it belongs to the user)
   */
  async deleteOrder(userId: string, orderId: string) {
    try {
      const orderDoc = this.ordersCollection.doc(orderId);
      const orderSnapshot = await orderDoc.get();

      if (!orderSnapshot.exists) {
        throw new NotFoundException('Order not found');
      }

      const orderData = orderSnapshot.data();
      if (orderData.userId !== userId) {
        throw new ForbiddenException('You cannot delete this order');
      }

      await orderDoc.delete();
      return { message: 'Order deleted successfully' };
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }
}
