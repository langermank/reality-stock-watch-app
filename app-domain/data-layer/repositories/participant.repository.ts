import type { Show } from "../entities/_types/show";
import { BaseRepository } from "./base.repository";

export class ParticipantRepository extends BaseRepository<Show.Participant> {
  _resourceName = "reality_show_participants";
}
