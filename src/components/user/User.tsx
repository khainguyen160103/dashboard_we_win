import { Button, Flex, Input, message } from 'antd'
import {useState} from 'react'
import { useUser } from '../../hooks/useUser';
import { UserTable } from './UserTable';
import { User } from '../../model/User';
import { UserModal, UserFormValues } from './UserModal';

export default function UserTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { create, update, delete: deleteUser, getUsers } = useUser;

  const { data: usersData, isLoading, isFetching } = getUsers({ q: searchQuery });
  const updateUser = update();

  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: User) => {
    setEditingUser(record);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };
  const handleUpdateStatus = (userId: string, status: string) => {
    const payload = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateUser.mutate({ id: userId, payload: { status: payload } });
  };
  
  const handleSubmit = async (values: UserFormValues) => {
    const selectedRoleId = values.role; // Role UUID string
    const formattedStatus = values.status?.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";


    const payload = {
      email: values.email,
      roleId: selectedRoleId,
      status: formattedStatus,
      fullName: values.name,
    };

    try {
      if (editingUser) {
        await update().mutateAsync({
          id: String(editingUser.id),
          payload: payload as unknown as Partial<User>,
        });
        message.success(`Đã cập nhật người dùng "${values.name}"`);
      } else {
        await create().mutateAsync(payload as unknown as Partial<User>);
        message.success(`Đã thêm người dùng "${values.name}"`);
      }
      setModalOpen(false);
      setEditingUser(null);
    } catch {
      message.error("Có lỗi xảy ra khi kết nối với REST API server!");
    }
  };

  void handleClose;
  void handleSubmit;

  const handleDelete = async (record: User) => {
    try {
      await deleteUser().mutateAsync(String(record.id));
      message.success(`Đã xóa người dùng "${record.fullName}"`);
    } catch {
      message.error("Có lỗi xảy ra khi xóa người dùng trên REST API server!");
    }
  };
 

  return (
    <>
    <div className="bg-white shadow-md rounded-2xl p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">

      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Input.Search
          placeholder="Tìm kiếm người dùng..."
          style={{ width: 400 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={(val) => setSearchQuery(val)}
          allowClear
        />
        <Button
          type="primary"
          onClick={handleOpenAdd}
         
        >
          + Thêm Người Dùng
        </Button>
      </Flex> 

      <UserTable userData={usersData}
       isLoading={isLoading} 
       isFetching={isFetching} 
       handleOpenEdit={handleOpenEdit} 
       handleDelete={handleDelete} 
       handleUpdateStatus={handleUpdateStatus} />
    </div>


    <UserModal
        open={modalOpen}
        editingUser={editingUser}
        // loading={createUser.isLoading || updateUser.isLoading}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  )
}
