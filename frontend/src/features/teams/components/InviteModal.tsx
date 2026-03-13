import { useForm }  from 'react-hook-form';
import Modal        from '../../../components/ui/Modal';
import Button       from '../../../components/ui/Button';
import Input        from '../../../components/ui/Input';
import { Select }   from '../../../components/ui/Select';
import { useInviteMember } from '../hooks/useTeams';
import type { Role } from '../../../types';

interface Props { teamId: string; isOpen: boolean; onClose: () => void }
interface FormData { email: string; role: Role }

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN',  label: 'Admin'  },
  { value: 'VIEWER', label: 'Viewer' },
];

export function InviteModal({ teamId, isOpen, onClose }: Props) {
  const { mutate: invite, isPending } = useInviteMember(teamId);
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ defaultValues: { role: 'MEMBER' } });

  const onSubmit = (data: FormData) => {
    invite(data, { onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Invite team member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address" type="email" placeholder="colleague@company.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
          })}
        />
        <Select label="Role" options={ROLE_OPTIONS} {...register('role')} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>Send invite</Button>
        </div>
      </form>
    </Modal>
  );
}
