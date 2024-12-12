export interface ITask {
  task_id: string;
  created_at: string;
  name: string;
  difficulty: number;
  points: number;
  status: boolean;
  member_id: string;
}