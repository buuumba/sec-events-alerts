import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFailedLoginAttempts1715340000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE auth.failed_login_attempts (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"      UUID NOT NULL,
        ip            VARCHAR(45),
        "attemptedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_failed_login_user_time
        ON auth.failed_login_attempts ("userId", "attemptedAt");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS auth.failed_login_attempts;`);
  }
}
