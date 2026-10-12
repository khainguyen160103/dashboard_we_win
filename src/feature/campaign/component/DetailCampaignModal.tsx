import { Modal } from 'antd'
type Props = { 
    isOpen: boolean, 
    onClose: () => void
}

export const DetailCampaignModal = ({isOpen, onClose}: Props) => {
  return (
    <Modal  open={isOpen} onOk={onClose} onCancel={onClose}
    footer={null}
      width={{
        xs: '90%',
        sm: '80%',
        md: '70%',
        lg: '60%',
        xl: '50%',
        xxl: '40%',
      }}>DetailCampaignModal</Modal>
  )
}
