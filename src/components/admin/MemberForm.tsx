import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { memberSchema, MEMBER_STATUSES, type MemberFormValues } from '../../lib/validation';
import type { Member, MemberStatus } from '../../types';
import { TextField, SelectField } from './AdminField';

interface MemberFormProps {
  // When provided, the form operates in edit mode and pre-fills with this member.
  initial?: Member | null;
  // Called with validated values on submit. Parent handles the Supabase call + toast.
  onSubmit: (values: MemberFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export default function MemberForm({ initial, onSubmit, onCancel, submitting }: MemberFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      city: '',
      status: 'active',
    },
  });

  // Sync form values when switching members / opening the modal
  useEffect(() => {
    if (initial) {
      reset({
        first_name: initial.first_name ?? '',
        last_name: initial.last_name ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        city: initial.city ?? '',
        status: initial.status as MemberStatus,
      });
    } else {
      reset({ first_name: '', last_name: '', email: '', phone: '', city: '', status: 'active' });
    }
  }, [initial, reset]);

  const busy = submitting || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }} className="member-form-grid">
        <TextField label="First name" placeholder="Ahmed" error={errors.first_name?.message} disabled={busy} {...register('first_name')} />
        <TextField label="Last name" placeholder="Yilmaz" error={errors.last_name?.message} disabled={busy} {...register('last_name')} />
      </div>
      <TextField label="Email" type="email" placeholder="ahmed@example.com" error={errors.email?.message} disabled={busy} {...register('email')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }} className="member-form-grid">
        <TextField label="Phone" placeholder="+1 (416) 555-0100" error={errors.phone?.message} disabled={busy} {...register('phone')} />
        <TextField label="City" placeholder="Toronto" error={errors.city?.message} disabled={busy} {...register('city')} />
      </div>
      <SelectField label="Status" error={errors.status?.message} disabled={busy} {...register('status')}>
        {MEMBER_STATUSES.map(s => (
          <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </SelectField>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(13,77,124,0.08)' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: '10px',
            border: '1.5px solid rgba(13,77,124,0.15)', background: 'transparent',
            color: 'var(--text-mid)', cursor: busy ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '0.625rem 1.5rem', borderRadius: '10px',
            border: 'none', cursor: busy ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600,
            background: 'linear-gradient(135deg, var(--uid-navy), var(--uid-mid))',
            color: '#fff',
            opacity: busy ? 0.7 : 1,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 6px 18px rgba(13,77,124,0.2)',
          }}
          onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(13,77,124,0.3)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 18px rgba(13,77,124,0.2)'; }}
        >
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Add member'}
        </button>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .member-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}
