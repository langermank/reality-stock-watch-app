import type { Core } from "../entities/_types/core";
import { BaseRepository } from "./base.repository";

export class PersonRepository extends BaseRepository<Core.Person> {
  _resourceName = "core_persons";
}
