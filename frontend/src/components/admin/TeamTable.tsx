import React from 'react';
import { Edit, Trash2, Mail } from 'lucide-react';
import { TeamMember } from '../../types/team';
import {
  TableContainer,
  Table,
  TableHeader,
  TableTh,
  TableBody,
  TableRow,
  TableTd
} from './ui/TableStyles'; 

interface TeamTableProps {
  data: TeamMember[];
  loading: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: number) => void;
  filterType: number;
}

const TeamTable: React.FC<TeamTableProps> = ({ data, loading, onEdit, onDelete, filterType }) => {
  
  const isPresidium = filterType === 0;
  const colSpanValue = isPresidium ? 5 : 6;

  let statusHeaderText = "Статус";
  if (filterType === 1) {
    statusHeaderText = "Профбюро";
  } else if (filterType === 2) {
    statusHeaderText = "Відділ";
  }

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableTh>Ім'я</TableTh>
            <TableTh>Посада</TableTh>
            <TableTh>Пошта</TableTh>
            <TableTh>Порядок</TableTh>
            {!isPresidium && <TableTh>{statusHeaderText}</TableTh>}
            <TableTh>Дії</TableTh>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableTd colSpan={colSpanValue} className="text-center text-gray-500">
                Завантаження...
              </TableTd>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableTd colSpan={colSpanValue} className="text-center text-gray-500">
                Членів команди поки немає
              </TableTd>
            </TableRow>
          ) : (
            data.map((member) => {
              
              const isHead = member.type === 1 || member.type === 2;
              
              const displayPosition = (isHead && member.isTemporary)
                ? member.position.replace("Голова", "В.О. Голови")
                : member.position;

              return (
                <TableRow key={member.id}>
                  <TableTd className="text-center">{member.name}</TableTd>
                  <TableTd className="text-center">{displayPosition}</TableTd>
                  
                  <TableTd className="text-center">
                    {member.email ? (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex justify-center text-blue-600 hover:text-blue-800 p-1"
                        title={member.email}
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableTd>

                  <TableTd className="text-center">{member.orderInd}</TableTd>
                  
                  {!isPresidium && (
                    <TableTd className="text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.isChoosed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.isChoosed ? 'Вибрано' : 'Не вибрано'}
                      </span>
                    </TableTd>
                  )}

                  <TableTd className="text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => onEdit(member)} className="text-blue-600 hover:text-blue-900 p-1">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDelete(member.id)} className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </TableTd>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamTable;