import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceEntity } from './entities/service.entity';

@Injectable()
export class ServicesService {
  private firestore = firebaseAdmin.firestore();
  private collection = this.firestore.collection('services');

  // 🆕 Create a new service
  async createService(dto: CreateServiceDto): Promise<ServiceEntity> {
    // 🔄 Format service name (remove spaces, lowercase)
    const formattedName = dto.name.replace(/\s+/g, '').toLowerCase();

    // 🔍 Check if service already exists
    const existingService = await this.collection
      .where('name', '==', formattedName)
      .limit(1) // 🔹 Performance improvement
      .get();

    if (!existingService.empty) {
      throw new BadRequestException(`Service '${dto.name}' already exists.`);
    }

    const newServiceRef = this.collection.doc();
    const newService: ServiceEntity = {
      serviceId: newServiceRef.id,
      name: formattedName,
      createdAt:
        firebaseAdmin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
    };

    await newServiceRef.set(newService);
    return new ServiceEntity(newService);
  }

  // 🔍 Get all services
  async getAllServices(): Promise<ServiceEntity[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => new ServiceEntity(doc.data()));
  }

  // 🔍 Get service by ID
  async getServiceById(serviceId: string): Promise<ServiceEntity> {
    const doc = await this.collection.doc(serviceId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    return new ServiceEntity(doc.data() as ServiceEntity);
  }

  // ✏️ Update a service
  async updateService(
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    const serviceRef = this.collection.doc(serviceId);
    const serviceDoc = await serviceRef.get();

    if (!serviceDoc.exists) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const updateData: Partial<ServiceEntity> = { ...dto };

    // 🛠 If updating name, apply formatting
    if (dto.name) {
      const formattedName = dto.name.replace(/\s+/g, '').toLowerCase();

      // 🔍 Ensure unique service name
      const existingService = await this.collection
        .where('name', '==', formattedName)
        .limit(1)
        .get();

      if (!existingService.empty) {
        throw new BadRequestException(
          `Service name '${dto.name}' is already in use.`,
        );
      }

      updateData.name = formattedName;
    }

    await serviceRef.update(updateData);
    const updatedService = await serviceRef.get();
    return new ServiceEntity(updatedService.data() as ServiceEntity);
  }

  // 🗑️ Delete a service
  async deleteService(serviceId: string): Promise<{ message: string }> {
    const serviceRef = this.collection.doc(serviceId);
    const serviceDoc = await serviceRef.get();

    if (!serviceDoc.exists) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    await serviceRef.delete();
    return { message: 'Service deleted successfully' };
  }
}
