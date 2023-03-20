import type { Core } from "./_types/core";
import { EntityRecord } from "./entity";

export class Person extends EntityRecord implements Core.Person {
  firstName: string | null = null;
  lastName: string | null = null;
  nickname: string | null = null;
  birthDate: Date | null = null;
  userId: string | null = null;

  constructor(properties: Partial<Person> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
