import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBruteForceNotifiedAt1715340000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth.users
        ADD COLUMN "bruteForceNotifiedAt" TIMESTAMP;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth.users
        DROP COLUMN IF EXISTS "bruteForceNotifiedAt";
    `);
  }
}
