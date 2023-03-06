import type { Show } from '../entities/_types/show';
import { BaseRepository } from './base.repository';

export class RealityShowRepository extends BaseRepository<Show.RealityShow> {
  _resourceName = 'realityShow';
}
