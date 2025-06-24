import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsServiceModule } from '../../../libs/products-service/src/products-service.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database connection
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'app_user',
      password: process.env.DB_PASSWORD || 'app_password',
      database: process.env.DB_NAME || 'enterprise_commerce',
      entities: ['libs/products-service/src/infrastructure/persistence/entities/*.entity.ts'],
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
      migrations: ['libs/products-service/src/infrastructure/persistence/migrations/*.ts'],
      migrationsRun: true,
    }),

    // Products Service Module
    ProductsServiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
