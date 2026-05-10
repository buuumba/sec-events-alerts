import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessedEvent } from '../../modules/security-events/entities/processed-event.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('database.url'),
        entities: [ProcessedEvent],
        synchronize: false,
        migrationsRun: true,
        migrationsTransactionMode: 'each' as const,
        migrations: [__dirname + '/../../databases/migrations/*.js'],
        logging: config.get<boolean>('database.logging'),
      }),
    }),
  ],
})
export class DatabaseModule {}
