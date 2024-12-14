import { fetchUsers, fetchTasks, fetchMembers } from '../services/superbaseService';

export const compareUserPoints = async (householdId: string): Promise<
  { user_id: string; username: string; total_points: number }[]
> => {
  try {
    const members = await fetchMembers(householdId);
    if (!members || members.length === 0) {
      return [];
    }
    
    const users = await fetchUsers();
    if (!users || users.length === 0) {
      return [];
    }

    const tasks = await fetchTasks(householdId);
    if (!tasks) {
      return [];
    }

    const userPointsMap = users.map((user) => {
      const userMemberIds = members.filter((m) => m.user_id === user.user_id).map((m) => m.member_id);
      const userTasks = tasks.filter((task) => userMemberIds.includes(task.member_id));
      const totalTaskPoints = userTasks.reduce((sum, task) => sum + task.points, 0);
      const totalPoints = user.total_points + totalTaskPoints;

      return {
        user_id: user.user_id,
        username: user.username,
        total_points: totalPoints,
      };
    });

    const sortedUsers = userPointsMap.sort((a, b) => b.total_points - a.total_points);

    return sortedUsers;
  } catch (error) {
    return [];
  }
};