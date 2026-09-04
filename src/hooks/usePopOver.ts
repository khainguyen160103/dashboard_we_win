import {useState} from 'react';
export const usePopOver = (initialState: boolean = false) => {
  const [open, setOpen] = useState(initialState);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return { open, hide, handleOpenChange };
};
