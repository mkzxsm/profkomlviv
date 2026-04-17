import React from 'react';
<<<<<<< HEAD
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
=======
import { Edit, Trash2 } from 'lucide-react';
import { TeamMember, MemberType, MemberTypeDisplay } from '../../types/team';
>>>>>>> upstream/main

interface TeamTableProps {
  data: TeamMember[];
  loading: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: number) => void;
<<<<<<< HEAD
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
=======
}

// Мапа числа (з бекенду) на MemberType
const typeMap: Record<number, MemberType> = {
  0: "Aparat",
  1: "Profburo",
  2: "Viddil",
};

const TeamTable: React.FC<TeamTableProps> = ({ data, loading, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Ім'я</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Посада</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Тип</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Порядок</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Статус</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">Дії</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Завантаження...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Членів команди поки немає</td>
            </tr>
          ) : (
            data.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {MemberTypeDisplay[typeMap[Number(member.type)] ?? "Aparat"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.orderInd}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Активний' : 'Неактивний'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => onEdit(member)} className="text-blue-600 hover:text-blue-900 p-1">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(member.id)} className="text-red-600 hover:text-red-900 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
>>>>>>> upstream/main
  );
};

export default TeamTable;