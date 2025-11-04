import React from 'react';
import { Edit, Trash2, Mail, MapPin, Instagram, Send } from 'lucide-react'; 
import { Faculty } from '../../types/faculty';
import { Department } from '../../types/department';
import {
  TableContainer,
  Table,
  TableHeader,
  TableTh,
  TableBody,
  TableRow,
  TableTd
} from './ui/TableStyles'; 

interface StructureTableProps {
    type: 'faculty' | 'department';
    data: (Faculty | Department)[];
    loading: boolean;
    onEdit: (item: Faculty | Department) => void;
    onDelete: (id: number) => void;
}

const FacultyHeader: React.FC = () => (
    <TableRow>
        <TableTh className="text-left">Факультет</TableTh>
        <TableTh>Голова</TableTh>
        <TableTh>Пошта</TableTh>
        <TableTh>Локація</TableTh>
        <TableTh>Посилання</TableTh>
        <TableTh>Статус</TableTh>
        <TableTh>Коледж</TableTh>
        <TableTh>Дії</TableTh>
    </TableRow>
);

const DepartmentHeader: React.FC = () => (
    <TableRow>
        <TableTh className="text-left">Відділ</TableTh>
        <TableTh>Голова</TableTh>
        <TableTh>Пошта</TableTh>
        <TableTh>Опис</TableTh>
        <TableTh>Статус</TableTh>
        <TableTh>Дії</TableTh>
    </TableRow>
);

const StructureTable: React.FC<StructureTableProps> = ({ type, data, loading, onEdit, onDelete }) => {
    
    const isFaculty = type === 'faculty';
    const colSpan = isFaculty ? 8 : 6;

    const renderFacultyRow = (item: Faculty) => {
        const union = item;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${union.address}`;
        
        return (
            <TableRow key={union.id}>
                <TableTd>{union.name}</TableTd>
                <TableTd className="text-center">
                    {union.head ? (
                        <span>{union.head.name}</span>
                    ) : (
                        <span className="text-gray-400 italic">Не призначено</span>
                    )}
                </TableTd>
                <TableTd className="text-center">
                    {union.head?.email ? (
                        <a href={`mailto:${union.head.email}`} className="flex justify-center text-blue-600 hover:text-blue-800 p-1" title={union.head.email}>
                            <Mail className="h-5 w-5" />
                        </a>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </TableTd>
                <TableTd className="text-center">
                    {(union.room || union.address) ? (
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex justify-center text-green-600 hover:text-green-800 p-1">
                            <MapPin className="h-5 w-5" />
                        </a>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </TableTd>
                <TableTd className="text-center">
                    <div className="flex justify-center space-x-1">
                        {union.telegram_Link && (
                            <a href={union.telegram_Link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 p-1" title="Telegram">
                                <Send className="h-5 w-5" />
                            </a>
                        )}
                        {union.instagram_Link && (
                            <a href={union.instagram_Link} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 p-1" title="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                        )}
                        {!union.telegram_Link && !union.instagram_Link && (<span className="text-gray-300">—</span>)}
                    </div>
                </TableTd>
                <TableTd className="text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${union.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {union.isActive ? 'Активне' : 'Неактивне'}
                    </span>
                </TableTd>
                <TableTd className="text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        union.isCollege 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                        {union.isCollege ? 'Так' : 'Ні'}
                    </span>
                </TableTd>
                <TableTd className="text-center">
                    <div className="flex justify-center space-x-2">
                        <button onClick={() => onEdit(union)} className="text-blue-600 hover:text-blue-900 p-1" title="Редагувати"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => onDelete(union.id)} className="text-red-600 hover:text-red-900 p-1" title="Видалити"><Trash2 className="h-5 w-5" /></button>
                    </div>
                </TableTd>
            </TableRow>
        );
    };

    const renderDepartmentRow = (item: Department) => {
        const dept = item;
        return (
            <TableRow key={dept.id}>
                <TableTd>{dept.name}</TableTd>
                <TableTd className="text-center">
                    {dept.head ? (
                        <span>{dept.head.name}</span>
                    ) : (
                        <span className="text-gray-400 italic">Не призначено</span>
                    )}
                </TableTd>
                <TableTd className="text-center">
                    {dept.head?.email ? (
                        <a href={`mailto:${dept.head.email}`} className="flex justify-center text-blue-600 hover:text-blue-800 p-1" title={dept.head.email}>
                            <Mail className="h-5 w-5" />
                        </a>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </TableTd>
                <TableTd className="max-w-xs truncate" title={dept.description}>{dept.description || '—'}</TableTd>
                <TableTd className="text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dept.isActive ? 'Активний' : 'Неактивний'}
                    </span>
                </TableTd>
                <TableTd className="text-center">
                    <div className="flex justify-center space-x-2">
                        <button onClick={() => onEdit(dept)} className="text-blue-600 hover:text-blue-900 p-1" title="Редагувати"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => onDelete(dept.id)} className="text-red-600 hover:text-red-900 p-1" title="Видалити"><Trash2 className="h-5 w-5" /></button>
                    </div>
                </TableTd>
            </TableRow>
        );
    };

    return (
        <TableContainer>
            <Table>
                <TableHeader>
                    {isFaculty ? <FacultyHeader /> : <DepartmentHeader />}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableTd colSpan={colSpan} className="text-center text-gray-500">Завантаження...</TableTd></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableTd colSpan={colSpan} className="text-center text-gray-500">{isFaculty ? 'Профбюро поки не додані' : 'Відділи поки не додані'}</TableTd></TableRow>
                    ) : (
                        isFaculty 
                            ? (data as Faculty[]).map(renderFacultyRow) 
                            : (data as Department[]).map(renderDepartmentRow)
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StructureTable;