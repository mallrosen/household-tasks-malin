export interface ITask {
    id: number;    
    name: string;  
    difficulty: number;  
    points: number;  
    household_id: number; 
    created_at: Date;
    status: boolean
  }