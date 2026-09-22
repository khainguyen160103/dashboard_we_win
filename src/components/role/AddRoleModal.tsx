import { Input, message, Modal } from 'antd'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { z } from 'zod'
import { roleQuery } from '../../hooks/query'


const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().toUpperCase().min(2).max(50),
  description: z.string().trim().max(200).optional()
})

type createRoleRequest = z.infer<typeof createRoleSchema>

type Props = {
  open: boolean
  onClose: () => void
}
  
export const AddRoleModal = ({ open, onClose }: Props) => {
  const { create } = roleQuery;
  
  const { mutate: createRole, isPending: isCreating } = create();

  const { handleSubmit , control } = useForm<createRoleRequest>({
    resolver: zodResolver(createRoleSchema),
  })

  const onSubmitForm = (data: createRoleRequest) => {
    console.log(data)
    createRole(data, {
      onSuccess: () => {
        onClose()
        message.success('Tạo vai trò thành công')
      }, 
      onError: () => {
        message.error('Có lỗi xảy ra khi tạo vai trò')
      }
    })
  }
  const handleOnclose = () => {
    onClose()
  } 
  return (
    <Modal
      title="Thêm vai trò mới"
      open={open}
      onOk={handleSubmit(onSubmitForm)}
      onCancel={handleOnclose}
      okText="Tạo vai trò"
      cancelText="Hủy"
      
      confirmLoading={isCreating}
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className='flex flex-col gap-4'>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
          <label className='flex flex-col gap-1'>
            <span className=''>Tên vai trò</span>
            <Input {...field} placeholder="Ví dụ: PM / Vận hành, Sales Account..." />
          </label>
          )}
    
        />
       
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <label className='flex flex-col gap-1'>
              <span className=''>Mã vai trò</span>
              <Input {...field} placeholder="Ví dụ: PM, SALES, KOC..." />
            </label>
          )}
        /> 
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <label className='flex flex-col gap-1'>
              <span className=''>Mô tả</span>
              <Input.TextArea {...field} rows={3} placeholder="Mô tả ngắn về vai trò này..." />
            </label>
          )}
        />
      </form>
    </Modal>
  )
}
