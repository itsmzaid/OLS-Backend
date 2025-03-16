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

      const pendingOrders = await this.ordersCollection
        .where('userId', '==', userId)
        .where('status', '==', 'Pending')
        .get();

      const batch = this.firestore.batch();
      pendingOrders.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      const orderCounterRef = this.firestore
        .collection('orderCounter')
        .doc('counter');
      let newOrderNumber: number | undefined;

      await this.firestore.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(orderCounterRef);

        if (!counterDoc.exists) {
          newOrderNumber = 1;
          transaction.set(orderCounterRef, { lastOrderNumber: newOrderNumber });
        } else {
          const lastOrderNumber = counterDoc.data()?.lastOrderNumber || 0;
          newOrderNumber = lastOrderNumber + 1;
          transaction.update(orderCounterRef, {
            lastOrderNumber: newOrderNumber,
          });
        }
      });

      if (newOrderNumber === undefined) {
        throw new Error('Failed to generate order number');
      }

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const deliveryCharges = 150;
      const finalAmount = totalAmount + deliveryCharges;

      const newOrderRef = this.ordersCollection.doc();

      const plainOrderItems = orderItems.map((item) => ({
        itemName: item.itemName,
        serviceName: item.serviceName,
        quantity: item.quantity,
        price: item.price,
      }));

      await newOrderRef.set({
        userId,
        userEmail,
        userName,
        userPhoneNo,
        status: 'Pending',
        orderNumber: newOrderNumber,
        totalAmount: finalAmount,
        deliveryCharges,
        paymentMethod,
        pickupDate,
        pickupTime,
        address,
        orderItems: plainOrderItems,
        createdAt: new Date(),
      });

      return {
        message: 'Order created successfully',
        orderId: newOrderRef.id,
        orderNumber: newOrderNumber,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async getOrdersByStatus(userId: string, status: string) {
    try {
      const userSnapshot = await this.firestore
        .collection('users')
        .doc(userId)
        .get();

      if (!userSnapshot.exists) {
        return {
          message: 'User not found',
          count: 0,
          orders: [],
        };
      }

      const snapshot = await this.ordersCollection
        .where('userId', '==', userId)
        .where('status', '==', status)
        .get();

      if (snapshot.empty) {
        return {
          message: 'No orders found for this status',
          count: 0,
          orders: [],
        };
      }

      const orders = snapshot.docs.map((doc: any) => ({
        orderNumber: doc.data().orderNumber,
        status: doc.data().status,
      }));

      return {
        message: 'Orders fetched successfully',
        count: orders.length,
        orders,
      };
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async getPendingOrder(userId: string) {
    try {
      const snapshot = await this.ordersCollection
        .where('userId', '==', userId)
        .where('status', '==', 'Pending')
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new NotFoundException('No pending order found');
      }

      const orderDoc = snapshot.docs[0];
      return { orderId: orderDoc.id, ...orderDoc.data() };
    } catch (error) {
      console.error('Error fetching pending order:', error);
      throw new Error('Failed to fetch order');
    }
  }
  async updateOrderStatus(userId: string, orderId: string, status: string) {
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

      await orderDoc.update({ status });
      return { message: `Order status updated to ${status}` };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

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
