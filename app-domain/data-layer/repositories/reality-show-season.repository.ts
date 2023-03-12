import type { Show } from "../entities/_types/show";
import { BaseRepository } from "./base.repository";

export class RealityShowSeasonRepository extends BaseRepository<Show.RealityShowSeries> {
  _resourceName = "reality_show_seasons";
}
