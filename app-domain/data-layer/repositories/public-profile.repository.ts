import type { Core } from "../entities/_types/core";
import { BaseRepository } from "./base.repository";

export class PublicProfileRepository extends BaseRepository<Core.PublicProfile> {
  _resourceName = "core_public_profiles";
}
