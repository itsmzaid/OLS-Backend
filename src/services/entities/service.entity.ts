export class ServiceEntity {
  serviceId: string;
  name: string;
  createdAt: FirebaseFirestore.Timestamp;

  constructor(partial: Partial<ServiceEntity>) {
    Object.assign(this, partial);
  }
}
