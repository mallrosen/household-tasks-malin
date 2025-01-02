export interface ITask {
  deleted: boolean;
  completed_at: string | number | Date;
  id: string;
  isProcessing: boolean;
  task_id: string;
  created_at: string;
  name: string;
  difficulty: string;
  points: number;
  status: boolean;
  member_id: string;
}