import type { Show } from '../entities/_types/show';
import { BaseRepository } from './base.repository';

export class RealityShowSeriesRepository extends BaseRepository<Show.RealityShowSeries> {
  _resourceName = 'realityShowSeries';
}
