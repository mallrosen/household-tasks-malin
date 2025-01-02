import { IUser } from './IUser';

export interface IMembers {
  member_id: string;
  user_id: string;
  household_id: string;
  role: string | null;
  Users: IUser | null;
  username: string;
  total_points: number;
  weekly_points: number;
}

export interface Participant {
  username: string;
  weekly_points: number;
}