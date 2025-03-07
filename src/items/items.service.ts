import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  private firestore = firebaseAdmin.firestore();
  private itemsCollection = this.firestore.collection('items');
  private servicesCollection = this.firestore.collection('services');

  // ✅ Create a new item (Ensure unique item per service)
  async createItem(dto: CreateItemDto) {
    const formattedServiceName = dto.serviceName
      .replace(/\s+/g, '')
      .toLowerCase();
    const formattedItemName = dto.name.trim().toLowerCase();

    // 🔍 Check if service exists
    const serviceQuery = await this.servicesCollection
      .where('name', '==', formattedServiceName)
      .limit(1)
      .get();

    if (serviceQuery.empty) {
      throw new BadRequestException(
        `Service with name "${dto.serviceName}" does not exist`,
      );
    }

    // 🔍 Check if the item already exists in the same service
    const itemQuery = await this.itemsCollection
      .where('serviceName', '==', formattedServiceName)
      .where('name', '==', formattedItemName)
      .limit(1)
      .get();

    if (!itemQuery.empty) {
      throw new ConflictException(
        `Item "${dto.name}" already exists in service "${dto.serviceName}"`,
      );
    }

    // ✅ Save new item
    const newItem = {
      serviceName: formattedServiceName,
      name: formattedItemName,
      price: dto.price,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.itemsCollection.add(newItem);
    return { itemId: docRef.id, ...newItem };
  }
  // ✅ Get items by service name
  async getItemsByService(serviceName: string) {
    const formattedServiceName = serviceName.replace(/\s+/g, '').toLowerCase(); // ✅ Normalize service name

    // 🔍 Fetch items of given service
    const snapshot = await this.itemsCollection
      .where('serviceName', '==', formattedServiceName)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(
        `No items found for service "${serviceName}"`,
      );
    }

    return snapshot.docs.map((doc) => ({
      itemId: doc.id,
      ...doc.data(),
    }));
  }

  // ✅ Get all items
  async getAllItems() {
    const snapshot = await this.itemsCollection.get();
    if (snapshot.empty) {
      throw new NotFoundException('No items found');
    }
    return snapshot.docs.map((doc) => ({
      itemId: doc.id,
      ...doc.data(),
    }));
  }

  // ✅ Get single item by ID
  async getItemById(itemId: string) {
    const doc = await this.itemsCollection.doc(itemId).get();
    if (!doc.exists) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
    return { itemId, ...doc.data() };
  }

  // ✅ Update item (Ensure uniqueness when updating name/service)
  // ✅ Update item (Ensure uniqueness when updating name/service)
  async updateItem(itemId: string, dto: UpdateItemDto) {
    const itemRef = this.itemsCollection.doc(itemId);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    const existingItem = itemDoc.data();
    if (!existingItem) {
      throw new NotFoundException(
        `Existing item data is missing for ID ${itemId}`,
      );
    }

    let updatedData: any = { ...dto };
    let formattedServiceName = existingItem.serviceName;
    let formattedItemName = existingItem.name;

    // 🔄 If serviceName is updated, verify if the service exists
    if (dto.serviceName) {
      formattedServiceName = dto.serviceName.replace(/\s+/g, '').toLowerCase();

      const serviceQuery = await this.servicesCollection
        .where('name', '==', formattedServiceName)
        .limit(1)
        .get();

      if (serviceQuery.empty) {
        throw new BadRequestException(
          `Service with name "${dto.serviceName}" does not exist`,
        );
      }

      updatedData.serviceName = formattedServiceName;
    }

    // 🔄 If name is updated, format it
    if (dto.name) {
      formattedItemName = dto.name.trim().toLowerCase();
      updatedData.name = formattedItemName;
    }

    // 🔍 Ensure unique combination of service + item name
    if (
      formattedServiceName !== existingItem.serviceName ||
      formattedItemName !== existingItem.name
    ) {
      const itemQuery = await this.itemsCollection
        .where('serviceName', '==', formattedServiceName)
        .where('name', '==', formattedItemName)
        .limit(1)
        .get();

      if (!itemQuery.empty) {
        throw new ConflictException(
          `Item "${formattedItemName}" already exists in service "${formattedServiceName}"`,
        );
      }
    }

    // 🔄 Remove undefined values
    updatedData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, value]) => value !== undefined),
    );

    await itemRef.update(updatedData);
    return { message: 'Item updated successfully' };
  }

  // ✅ Delete item
  async deleteItem(itemId: string) {
    const itemRef = this.itemsCollection.doc(itemId);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    await itemRef.delete();
    return { message: 'Item deleted successfully' };
  }
}
