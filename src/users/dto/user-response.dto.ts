import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  nickname?: string | null;
  telegram?: string | null;
  age?: number | null;
  lastLogin?: Date | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
