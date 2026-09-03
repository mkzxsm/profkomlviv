import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, Trash2, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminUser, AdminCreateFormData, ChangePasswordFormData } from '../../types/admin';
import {
  TableContainer,
  Table,
  TableHeader,
  TableTh,
  TableBody,
  TableRow,
  TableTd,
} from './ui/TableStyles';
import { ModalInput, ModalLabel, ModalButton } from './ui/ModalStyles';

const PASSWORD_HINT = 'Мінімум 8 символів, велика літера, цифра та спецсимвол';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
};

const AdminsManager: React.FC = () => {
  const { user, logout } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AdminCreateFormData>({ username: '', password: '' });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/list`, {
        headers: getAuthHeaders(),
      });
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching admins:', getApiErrorMessage(error, 'Помилка завантаження'));
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleOpenAddModal = () => {
    setCreateForm({ username: '', password: '' });
    setCreateError('');
    setShowCreatePassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCreateForm({ username: '', password: '' });
    setCreateError('');
    setShowCreatePassword(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/create`,
        { username: createForm.username.trim(), password: createForm.password },
        { headers: getAuthHeaders() }
      );
      await fetchAdmins();
      handleCloseModal();
    } catch (error) {
      setCreateError(getApiErrorMessage(error, 'Не вдалося створити адміністратора'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    const isSelf = String(user?.id) === String(admin.id);
    const confirmMessage = isSelf
      ? 'Ви видаляєте власний обліковий запис і будете виведені з системи. Продовжити?'
      : `Видалити адміністратора "${admin.username}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/delete/${admin.id}`, {
        headers: getAuthHeaders(),
      });

      if (isSelf) {
        logout();
        return;
      }

      await fetchAdmins();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Не вдалося видалити адміністратора'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новий пароль і підтвердження не збігаються');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: getAuthHeaders() }
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Пароль успішно змінено');
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, 'Не вдалося змінити пароль'));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Управління адміністраторами</h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <UserPlus className="h-5 w-5" />
          <span>Додати адміністратора</span>
        </button>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableTh>Логін</TableTh>
              <TableTh>Роль</TableTh>
              <TableTh>Дії</TableTh>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableTd colSpan={3} className="text-center text-gray-500">
                  Завантаження...
                </TableTd>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableTd colSpan={3} className="text-center text-gray-500">
                  Адміністраторів поки немає
                </TableTd>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const isSelf = String(user?.id) === String(admin.id);
                return (
                  <TableRow key={admin.id}>
                    <TableTd className="text-left font-medium">
                      {admin.username}
                      {isSelf && (
                        <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Ви
                        </span>
                      )}
                    </TableTd>
                    <TableTd className="text-center">{admin.role || 'admin'}</TableTd>
                    <TableTd className="text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(admin)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Видалити адміністратора"
                        >
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

      <div className="mt-8 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Змінити свій пароль</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <ModalLabel required htmlFor="currentPassword">Поточний пароль</ModalLabel>
            <div className="relative">
              <ModalInput
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <ModalLabel required htmlFor="newPassword">Новий пароль</ModalLabel>
            <div className="relative">
              <ModalInput
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{PASSWORD_HINT}</p>
          </div>
          <div>
            <ModalLabel required htmlFor="confirmPassword">Підтвердження пароля</ModalLabel>
            <ModalInput
              id="confirmPassword"
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{passwordError}</p>
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">{passwordSuccess}</p>
            </div>
          )}
          <div className="flex justify-end">
            <ModalButton type="submit" variant="primary" disabled={passwordSubmitting}>
              {passwordSubmitting ? 'Збереження...' : 'Змінити пароль'}
            </ModalButton>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold text-gray-900">Додати адміністратора</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" title="Закрити">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <ModalLabel required htmlFor="adminUsername">Логін (email)</ModalLabel>
                <ModalInput
                  id="adminUsername"
                  type="email"
                  required
                  maxLength={100}
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="admin@profkom.com"
                />
              </div>
              <div>
                <ModalLabel required htmlFor="adminPassword">Пароль</ModalLabel>
                <div className="relative">
                  <ModalInput
                    id="adminPassword"
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCreatePassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">{PASSWORD_HINT}</p>
              </div>
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{createError}</p>
                </div>
              )}
              <div className="flex justify-end space-x-4 border-t pt-4">
                <ModalButton type="button" onClick={handleCloseModal} variant="secondary">
                  Скасувати
                </ModalButton>
                <ModalButton type="submit" variant="primary" disabled={createSubmitting}>
                  {createSubmitting ? 'Створення...' : 'Створити'}
                </ModalButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminsManager;
