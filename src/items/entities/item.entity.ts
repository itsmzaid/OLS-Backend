export class Item {
  itemId: string; // Firestore document ID
  serviceName: string; // ✅ Now stored from user input
  name: string; // Example: Hoodie, T-shirt, Jeans, etc.
  price: number;
  createdAt: FirebaseFirestore.Timestamp;
}
