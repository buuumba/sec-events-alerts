import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('failed_login_attempts')
@Index('idx_failed_login_user_time', ['userId', 'attemptedAt'])
export class FailedLoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ nullable: true })
  ip?: string;

  @CreateDateColumn()
  attemptedAt: Date;
}
