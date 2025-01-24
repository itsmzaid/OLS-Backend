import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins and paths
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allow all standard HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
  });

  // Global validation pipe for incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if extra properties are sent
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Set up Swagger for API documentation
  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('API documentation for the Authentication Module')
    .setVersion('1.0')
    .addBearerAuth() // Add bearer token support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Documentation available at /api

  // Initialize Firebase Admin SDK
  try {
    const firebaseKeyFilePath = 'src/config/service-account-key.json';
    const firebaseServiceAccount = JSON.parse(
      fs.readFileSync(firebaseKeyFilePath).toString(),
    );

    if (firebaseAdmin.apps.length === 0) {
      console.log('Initializing Firebase Admin SDK...');
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    process.exit(1); // Exit the application if Firebase initialization fails
  }

  // Define the server port
  const port = process.env.PORT || 3000;

  // Start the server
  await app.listen(port);

  // Log success messages
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API documentation available at http://localhost:${port}/api`);
}

bootstrap();
