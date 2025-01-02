import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';

interface MembersListProps {
  members: IMembers[];
  users: IUser[];
  selectedMember: string | null;
  onMemberClick: (memberId: string) => void;
}

export const MembersList = ({ members, users, selectedMember, onMemberClick }: MembersListProps) => {
  return (
    <ul className="members-list">
      {members.map((member) => {
        const user = users.find(user => user.user_id === member.user_id);
        return (
          <li key={member.member_id} className="member-item">
            <button
              onClick={() => onMemberClick(member.member_id)}
              className={`member-button ${selectedMember === member.member_id ? 'active' : ''}`}
            >
              <span className='memberAndPoints'>
                {user?.username || 'Unknown User'}
                {user?.total_points != null && (
                  <span className="points"> - {user.total_points} points</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};