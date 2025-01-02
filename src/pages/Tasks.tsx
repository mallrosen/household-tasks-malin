// import { useUserAndTasks } from '../hooks/useUserAndTasks';
// import { useTaskHandlers } from '../hooks/useTaskHandlers';
// import { AddTaskForm } from '../components/AddTaskForm';
// import { TaskList } from '../components/TaskList';
// import "../styles/main.scss";
// import { supabase } from '../services/supabaseClient';
// import { useState } from 'react';

import { useState } from "react";
import { AddTaskForm } from "../components/AddTaskForm";
import { TaskList } from "../components/TaskList";
import { supabase } from "../services/supabaseClient";
import { useUserAndTasks } from "../hooks/useUserAndTasks";
import { useTaskHandlers } from "../hooks/useTaskHandlers";

// export const Tasks = () => {
//   const {
//     memberId,
//     taskList,
//     setTaskList,
//     userPoints,
//     setUserPoints,
//     error,
//     setError,
//     householdId,
//   } = useUserAndTasks();

//   const { toggleTaskCompletion, removeTask } = useTaskHandlers(
//     householdId,
//     taskList,
//     setTaskList,
//     userPoints,
//     setUserPoints,
//     setError,
//     error,
//     memberId,
//   );

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (task: { name: string; difficulty: string; points: number }) => {
//     if (!memberId) {
//       setError('Member ID is missing!');
//       return;
//     }
  
//     if (isSubmitting) return;
  
//     setIsSubmitting(true);
  
//     try {
//       const { data, error } = await supabase
//         .from('Tasks')
//         .insert({
//           name: task.name,
//           difficulty: task.difficulty,
//           points: task.points,
//           status: false,
//           member_id: memberId,
//         })
//         .select();
  
//       if (error) {
//         setError('Error adding task: ' + error.message);
//       } else if (data) {
//         setTaskList((prevTaskList) => [...prevTaskList, data[0]]);
//       }
//     } catch (error) {
//       setError('Error adding task: ' + (error as Error).message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!householdId || !taskList) {
//     return <div>Loading tasks...</div>;
//   }

//   return (
//     <>
//       <div className='taskPage'>
//         <TaskList
//           tasks={taskList}
//           onToggle={toggleTaskCompletion}
//           onRemove={removeTask}
//         />

//         <div className='addTaskForm'>
//         <AddTaskForm handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
//         </div>

//         {error && <p style={{ color: 'red' }}>{error}</p>}
//       </div>
//     </>
//   );
// };



export const Tasks = () => {
  const {
    memberId,
    taskList,
    setTaskList,
    userPoints,
    setUserPoints,
    error,
    setError,
    householdId,
  } = useUserAndTasks();

  const { toggleTaskCompletion, removeTask } = useTaskHandlers(
    householdId,
    taskList,
    setTaskList,
    userPoints,
    setUserPoints,
    setError,
    error,
    memberId,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (task: { name: string; difficulty: string; points: number }) => {
    if (!memberId) {
      setError('Member ID is missing!');
      return;
    }
  
    if (isSubmitting) return;
  
    setIsSubmitting(true);
  
    try {
      const { data, error } = await supabase
        .from('Tasks')
        .insert({
          name: task.name,
          difficulty: task.difficulty,
          points: task.points,
          status: false,
          member_id: memberId,
        })
        .select();
  
      if (error) {
        setError('Error adding task: ' + error.message);
      } else if (data) {
        setTaskList((prevTaskList) => [...prevTaskList, data[0]]);
      }
    } catch (error) {
      setError('Error adding task: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!householdId || !taskList) {
    return <div>Loading tasks...</div>;
  }

  // Filtrera bort borttagna uppgifter
  const visibleTasks = taskList.filter(task => !task.deleted);

  return (
    <>
      <div className='taskPage'>
        <TaskList
          tasks={visibleTasks} // Skicka endast uppgifter som inte är borttagna
          onToggle={toggleTaskCompletion}
          onRemove={removeTask}
        />

        <div className='addTaskForm'>
          <AddTaskForm handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
};