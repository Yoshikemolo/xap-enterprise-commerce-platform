import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsTestingModule } from './products-testing.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Products Testing Module (simplified, no database)
    ProductsTestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
