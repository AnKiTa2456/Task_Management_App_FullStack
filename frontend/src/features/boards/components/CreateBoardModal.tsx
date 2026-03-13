import { useForm }        from 'react-hook-form';
import Modal   from '../../../components/ui/Modal';
import Button  from '../../../components/ui/Button';
import Input   from '../../../components/ui/Input';
import { useCreateBoard } from '../hooks/useBoards';
import type { CreateBoardDto } from '../../../services/api/boards.api';

interface Props { isOpen: boolean; onClose: () => void }

export function CreateBoardModal({ isOpen, onClose }: Props) {
  const { mutate: createBoard, isPending } = useCreateBoard();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBoardDto>();

  const onSubmit = (data: CreateBoardDto) => {
    createBoard(data, { onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Create new board">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Board name"
          placeholder="e.g. Sprint 14, Product Roadmap"
          error={errors.name?.message}
          {...register('name', { required: 'Board name is required' })}
        />
        <Input label="Description (optional)" placeholder="What is this board for?" {...register('description')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>Create board</Button>
        </div>
      </form>
    </Modal>
  );
}
