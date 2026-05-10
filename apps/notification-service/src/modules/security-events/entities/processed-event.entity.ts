import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'notification', name: 'processed_events' })
export class ProcessedEvent {
  @PrimaryColumn('uuid')
  eventId: string;

  @CreateDateColumn()
  processedAt: Date;
}
