import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcessedEvents1715340001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE processed_events (
        "eventId"     UUID PRIMARY KEY,
        "processedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS processed_events;`);
  }
}
