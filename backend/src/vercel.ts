import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';

let app: INestApplication;

export default async function handler(req: Request, res: Response) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Setup Swagger
    const config = new DocumentBuilder()
      .setTitle('Playspot API')
      .setDescription('The Playspot API description')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory, {
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js',
      ],
    });

    // Initialize the app without starting a local port listener
    await app.init();
  }
  
  // Pass the request to the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}
