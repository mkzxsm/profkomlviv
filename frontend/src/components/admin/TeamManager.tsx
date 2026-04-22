import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import TeamTable from './TeamTable';
import TeamModal from './TeamModal';
import { TeamMember, TeamFormData } from '../../types/team';

interface TeamManagerProps {
  data: TeamMember[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

const TeamManager: React.FC<TeamManagerProps> = ({ data, loading, fetchData }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterType, setFilterType] = useState<number>(0);
  const [teamFormData, setTeamFormData] = useState<TeamFormData>({
    name: '',
    position: '',
    type: 0,
    email: '',
    imageUrl: '',
    orderInd: 0,
    isTemporary: false,
  });

  const handleOpenAddModal = () => {
    const membersOfType = data.filter(m => m.type === filterType);
    const indicesSet = new Set(membersOfType.map(member => member.orderInd));

    let nextOrderInd = 0;
    while (indicesSet.has(nextOrderInd)) {
      nextOrderInd++;
    }

    setTeamFormData({
      name: '',
      position: '',
      type: filterType,
      email: '',
      imageUrl: '',
      orderInd: nextOrderInd,
      isTemporary: false,
    });

    setEditingTeamMember(null);
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('Name', teamFormData.name);
      formData.append('Position', teamFormData.position);
      formData.append('Type', teamFormData.type.toString());
      formData.append('Email', teamFormData.email || '');
      formData.append('OrderInd', teamFormData.orderInd.toString());
      formData.append('IsTemporary', teamFormData.isTemporary.toString());

      if (selectedFile) {
        formData.append('Image', selectedFile);
      } else if (editingTeamMember) {
        formData.append('ImageUrl', editingTeamMember.imageUrl || '');
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };

      if (editingTeamMember) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/team/${editingTeamMember.id}`, formData, { headers });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/team`, formData, { headers });
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error saving team member:', axiosError.response?.data || axiosError.message);
    }
  };

  const handleDeleteTeamMember = async (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цього члена команди?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/team/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        await fetchData();
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error deleting team member:', axiosError.response?.data || axiosError.message);
      }
    }
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamFormData({
      name: member.name,
      position: member.position,
      type: member.type,
      email: member.email || '',
      imageUrl: member.imageUrl || '',
      orderInd: member.orderInd,
      isTemporary: member.isTemporary,
    });
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTeamMember(null);
    setSelectedFile(null);
    setTeamFormData({
      name: '',
      position: '',
      type: 0,
      email: '',
      imageUrl: '',
      orderInd: 0,
      isTemporary: false,
    });
  };

  const filteredData = data
    .filter(member => member.type === filterType)
    .sort((a, b) => a.orderInd - b.orderInd);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900">Управління командою</h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 ml-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>Члени Президії</option>
            <option value={1}>Голови Профбюро Студентів</option>
            <option value={2}>Голови Відділів</option>
          </select>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <UserPlus className="h-5 w-5" />
          <span>Додати члена команди</span>
        </button>
      </div>

      <TeamTable
        data={filteredData}
        loading={loading}
        onEdit={handleEditTeamMember}
        onDelete={handleDeleteTeamMember}
        filterType={filterType}
      />

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTeamMember ? 'Редагувати члена команди' : 'Додати члена команди'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <TeamModal
              formData={teamFormData}
              setFormData={setTeamFormData}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              editingItem={editingTeamMember}
              onSubmit={handleTeamSubmit}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TeamManager;