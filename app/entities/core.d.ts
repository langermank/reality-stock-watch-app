namespace Core {
  export type Uuid = string;

  export interface EntityRecord {
    id: Uuid?;
    createdAt: Date?;
    updatedAt: Date?;
    deletedAt: Date?;
  }

  export interface Person extends EntityRecord {
    firstName: string?;
    lastName: string?;
    nickname: string?;
    birthDate: Date?;
    userId: Uuid?;
  }
  
  export interface PublicProfile extends EntityRecord {
    displayName: string?;
    avatarUrl: string?;
    ownerId: Uuid?;
    userId: Uuid?;
  }
}