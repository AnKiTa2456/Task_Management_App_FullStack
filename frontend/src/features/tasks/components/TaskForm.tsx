import { useForm }  from 'react-hook-form';
import Input        from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select }   from '../../../components/ui/Select';
import Button       from '../../../components/ui/Button';
import type { CreateTaskDto } from '../../../services/api/tasks.api';

interface TaskFormProps {
  columnId:   string;
  onSubmit:   (data: CreateTaskDto) => void;
  onCancel:   () => void;
  isLoading?: boolean;
  defaults?:  Partial<CreateTaskDto>;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low'    },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High'   },
  { value: 'URGENT', label: 'Urgent' },
];

export function TaskForm({ columnId, onSubmit, onCancel, isLoading, defaults }: TaskFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTaskDto>({
    defaultValues: { columnId, priority: 'MEDIUM', ...defaults },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input type="hidden" {...register('columnId')} />
      <Input
        label="Title" placeholder="Task title"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />
      <Textarea label="Description" placeholder="Describe this task…" rows={3} {...register('description')} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
        <Input label="Due date" type="date" {...register('dueDate')} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" loading={isLoading}>Save task</Button>
      </div>
    </form>
  );
}
