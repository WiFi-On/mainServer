import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { Street } from './street.entity';

@Entity('providersonstreet')
export class ProviderOnStreet {
  @PrimaryColumn()
  provider_id: number;

  @PrimaryColumn()
  street_id: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Street)
  @JoinColumn({ name: 'street_id' })
  street: Street;
}
