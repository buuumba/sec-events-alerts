import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('database.url'),
        schema: config.getOrThrow<string>('database.schema'),
        autoLoadEntities: true,
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
