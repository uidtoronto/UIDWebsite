import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, ArrowRight, UserPlus, Loader2, CheckCircle2,
  Users, Heart, ShieldCheck, CreditCard, X, Lock,
} from 'lucide-react';
import { UIDLogo } from '../components/UIDLogo';
import { useToast } from '../context/ToastContext';
import { saveRegistration } from '../services/registration';
import { useCheckout } from '../hooks/useCheckout';
import { EmbeddedCheckout } from '../components/stripe/EmbeddedCheckout';
import { STRIPE_PRODUCTS } from '../stripe-config';

// Map membership_type → Stripe price ID. 'student' and 'adult' use
// the monthly price; 'pensioner' uses the annual price as a discount.
const PRICE_ID_BY_TYPE: Record<string, string> = {
  adult: STRIPE_PRODUCTS.find((p) => p.id === 'monthly')!.priceId,
  student: STRIPE_PRODUCTS.find((p) => p.id === 'monthly')!.priceId,
  pensioner: STRIPE_PRODUCTS.find((p) => p.id === 'annual')!.priceId,
};

const familyMemberSchema = z.object({
  full_name: z.string().min(1, 'Required'),
  age: z.coerce.number().int().min(0).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  member_type: z.enum(['adult', 'child']).optional(),
});

const registrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  birth_date: z.string().min(1, 'Birthdate is required'),
  email: z.string().email('Enter a valid email'),
  mobile_phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  address_line1: z.string().min(1, 'Street address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  membership_type: z.enum(['adult', 'student', 'pensioner']),
  is_family: z.boolean(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegistrationForm = z.infer<typeof registrationSchema>;
type FamilyMemberForm = z.infer<typeof familyMemberSchema>;

const PROVINCES = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];

export default function MembershipRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFamily, setIsFamily] = useState(false);
  const [familyCount, setFamilyCount] = useState(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberForm[]>([
    { full_name: '', age: undefined, gender: undefined, member_type: undefined },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const { startCheckout } = useCheckout();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      birth_date: '',
      email: '',
      mobile_phone: '',
      password: '',
      confirmPassword: '',
      address_line1: '',
      address_line2: '',
      city: '',
      province: 'ON',
      postal_code: '',
      country: 'Canada',
      membership_type: 'adult',
      is_family: false,
    },
  });

  const membershipTypeValue = watch('membership_type');

  const updateFamilyMember = (index: number, field: keyof FamilyMemberForm, value: string | number) => {
    setFamilyMembers(prev =>
      prev.map((fm, i) => (i === index ? { ...fm, [field]: value } : fm)),
    );
  };

  const updateFamilyCount = (count: number) => {
    const safe = Math.max(1, Math.min(10, count));
    setFamilyCount(safe);
    setFamilyMembers(prev => {
      const next = [...prev];
      while (next.length < safe) {
        next.push({ full_name: '', age: undefined, gender: undefined, member_type: undefined });
      }
      while (next.length > safe) next.pop();
      return next;
    });
  };

  const onSubmit = async (values: RegistrationForm) => {
    if (isFamily) {
      const validMembers = familyMembers.filter(fm => fm.full_name.trim() !== '');
      if (validMembers.length === 0) {
        toast('Please add at least one family member or uncheck family registration.', 'error');
        return;
      }
      const incomplete = familyMembers.some(fm => fm.full_name.trim() !== '' && !fm.member_type);
      if (incomplete) {
        toast('Please select a type (Adult/Child) for each family member.', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const regRes = await saveRegistration({
        first_name: values.first_name,
        last_name: values.last_name,
        birth_date: values.birth_date,
        email: values.email,
        mobile_phone: values.mobile_phone,
        password: values.password,
        address_line1: values.address_line1,
        address_line2: values.address_line2,
        city: values.city,
        province: values.province,
        postal_code: values.postal_code,
        country: values.country,
        membership_type: values.membership_type,
        is_family: isFamily,
        family_members: isFamily ? familyMembers.filter(fm => fm.full_name.trim() !== '') : [],
      });

      if (regRes.error) {
        toast(regRes.error, 'error');
        setSubmitting(false);
        return;
      }

      toast('Registration saved — loading secure checkout…', 'success');

      // Create an Embedded Checkout Session (no redirect).
      const priceId = PRICE_ID_BY_TYPE[values.membership_type] ?? PRICE_ID_BY_TYPE.adult;
      const result = await startCheckout({
        priceId,
        mode: 'subscription',
        returnUrl: `${window.location.origin}/payment-success?member=${regRes.data!.memberId}`,
        memberId: regRes.data!.memberId,
      });

      if (!result) {
        // Checkout setup failed — guide user to pricing page as fallback
        navigate('/pricing');
        return;
      }

      // Show the embedded checkout overlay
      setCheckoutSecret(result.clientSecret);
      setSubmitting(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Something went wrong. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  const handleCheckoutComplete = () => {
    setCheckoutSecret(null);
    navigate('/dashboard');
  };

  const handleCheckoutClose = () => {
    setCheckoutSecret(null);
    toast('Checkout cancelled. You can complete payment from the pricing page.', 'info');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)',
      }}
    >
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {/* Orbs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,200,200,0.14), transparent 70%)', animation: 'floatOrb 9s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,77,124,0.07), transparent 70%)', animation: 'floatOrb 11s ease-in-out infinite 2s', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px', margin: '0 auto', padding: '120px 1.25rem 4rem' }}>
        {/* Back link + logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 500, color: 'var(--uid-navy)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
          <UIDLogo width={120} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.5rem' }}>
              UID Toronto Membership
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 0.5rem', lineHeight: 1.15 }}>
              <em>Become a Member</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 300, maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Complete the form below to join the UID Toronto community. After registration, you'll be securely redirected to Stripe to complete your membership payment.
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { icon: ShieldCheck, label: 'Secure payment' },
              { icon: Heart, label: 'Support the community' },
              { icon: CreditCard, label: 'Cancel anytime' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-mid)', fontWeight: 500 }}>
                <Icon size={15} style={{ color: 'var(--uid-teal)' }} /> {label}
              </div>
            ))}
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(62,200,200,0.18)',
              boxShadow: '0 32px 80px rgba(13,77,124,0.12)',
              padding: '2.5rem',
            }}
          >
          {checkoutSecret && (
            <EmbeddedCheckout
              clientSecret={checkoutSecret}
              onClose={handleCheckoutClose}
              onComplete={handleCheckoutComplete}
            />
          )}
            {/* ── Personal Information ── */}
            <SectionTitle icon={<UserPlus size={18} />} title="Personal Information" />
            <div className="reg-grid">
              <Field label="First Name" error={errors.first_name?.message} required>
                <input {...register('first_name')} className="reg-input" placeholder="John" />
              </Field>
              <Field label="Last Name" error={errors.last_name?.message} required>
                <input {...register('last_name')} className="reg-input" placeholder="Doe" />
              </Field>
              <Field label="Birthdate" error={errors.birth_date?.message} required>
                <input type="date" {...register('birth_date')} className="reg-input" />
              </Field>
            </div>

            {/* ── Membership Type ── */}
            <SectionTitle icon={<Heart size={18} />} title="Membership Type" />
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {(['adult', 'student', 'pensioner'] as const).map(type => (
                <label key={type} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  padding: '0.625rem 1rem', borderRadius: '99px',
                  border: `1.5px solid ${membershipTypeValue === type ? 'var(--uid-teal)' : 'rgba(13,77,124,0.15)'}`,
                  background: membershipTypeValue === type ? 'rgba(62,200,200,0.10)' : '#fff',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
                  color: membershipTypeValue === type ? 'var(--uid-teal-dark)' : 'var(--text-mid)',
                }}>
                  <input type="radio" value={type} {...register('membership_type')} style={{ accentColor: 'var(--uid-teal)' }} />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
            {errors.membership_type?.message && (
              <p style={{ margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#dc2626' }}>{errors.membership_type.message}</p>
            )}

            {/* ── Contact ── */}
            <SectionTitle icon={<Users size={18} />} title="Contact" />
            <div className="reg-grid">
              <Field label="Email" error={errors.email?.message} required>
                <input type="email" {...register('email')} className="reg-input" placeholder="you@example.com" />
              </Field>
              <Field label="Mobile Phone" error={errors.mobile_phone?.message} required>
                <input {...register('mobile_phone')} className="reg-input" placeholder="+1 (416) 555-0100" />
              </Field>
            </div>

            {/* ── Account ── */}
            <SectionTitle icon={<Lock size={18} />} title="Account" />
            <div className="reg-grid">
              <Field label="Password" error={errors.password?.message} required>
                <input type="password" {...register('password')} className="reg-input" placeholder="Min. 6 characters" autoComplete="new-password" />
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword?.message} required>
                <input type="password" {...register('confirmPassword')} className="reg-input" placeholder="Re-enter password" autoComplete="new-password" />
              </Field>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-soft)', fontWeight: 300, margin: '0 0 0.5rem' }}>
              Minimum 6 characters — no special characters required.
            </p>

            {/* ── Address ── */}
            <SectionTitle icon={<CreditCard size={18} />} title="Mailing Address" />
            <div className="reg-grid">
              <Field label="Street Address" error={errors.address_line1?.message} required full>
                <input {...register('address_line1')} className="reg-input" placeholder="123 Main St" />
              </Field>
              <Field label="Address Line 2" error={errors.address_line2?.message}>
                <input {...register('address_line2')} className="reg-input" placeholder="Apt, suite, etc. (optional)" />
              </Field>
              <Field label="City" error={errors.city?.message} required>
                <input {...register('city')} className="reg-input" placeholder="Toronto" />
              </Field>
              <Field label="Province" error={errors.province?.message} required>
                <select {...register('province')} className="reg-input">
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Postal Code" error={errors.postal_code?.message} required>
                <input {...register('postal_code')} className="reg-input" placeholder="M4B 1B3" />
              </Field>
              <Field label="Country" error={errors.country?.message} required>
                <input {...register('country')} className="reg-input" placeholder="Canada" />
              </Field>
            </div>

            {/* ── Family Registration ── */}
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(13,77,124,0.08)' }}>
              <SectionTitle icon={<Heart size={18} />} title="Family Registration" />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-mid)', fontWeight: 300, marginBottom: '1rem', lineHeight: 1.6 }}>
                Are you registering as a family? Add your family members below — each will be included in your membership.
              </p>

              {/* Toggle */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <ToggleChip active={!isFamily} onClick={() => setIsFamily(false)} label="No, individual" />
                <ToggleChip active={isFamily} onClick={() => setIsFamily(true)} label="Yes, register family" />
              </div>

              {isFamily && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Member count selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 500, color: 'var(--uid-navy)' }}>
                      Number of family members:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: '10px', border: '1.5px solid rgba(13,77,124,0.15)', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => updateFamilyCount(familyCount - 1)}
                        disabled={familyCount <= 1}
                        style={countBtn(familyCount <= 1)}
                        aria-label="Decrease family members"
                      >−</button>
                      <span style={{ padding: '0 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--uid-navy)', minWidth: '32px', textAlign: 'center' }}>{familyCount}</span>
                      <button
                        type="button"
                        onClick={() => updateFamilyCount(familyCount + 1)}
                        disabled={familyCount >= 10}
                        style={countBtn(familyCount >= 10)}
                        aria-label="Increase family members"
                      >+</button>
                    </div>
                  </div>

                  {/* Family member rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {familyMembers.map((fm, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 2fr) 0.7fr 1fr 1fr 32px',
                          gap: '0.625rem',
                          alignItems: 'flex-end',
                          padding: '0.875rem',
                          borderRadius: '12px',
                          background: 'rgba(13,77,124,0.03)',
                          border: '1px solid rgba(13,77,124,0.06)',
                        }}
                        className="family-row"
                      >
                        <Field label={i === 0 ? 'Full Name' : ''} compact>
                          <input
                            value={fm.full_name}
                            onChange={e => updateFamilyMember(i, 'full_name', e.target.value)}
                            className="reg-input"
                            placeholder="Family member name"
                          />
                        </Field>
                        <Field label={i === 0 ? 'Age' : ''} compact>
                          <input
                            type="number"
                            value={fm.age ?? ''}
                            onChange={e => updateFamilyMember(i, 'age', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                            className="reg-input"
                            placeholder="Age"
                          />
                        </Field>
                        <Field label={i === 0 ? 'Gender' : ''} compact>
                          <select
                            value={fm.gender ?? ''}
                            onChange={e => updateFamilyMember(i, 'gender', e.target.value)}
                            className="reg-input"
                          >
                            <option value="">Select…</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </Field>
                        <Field label={i === 0 ? 'Type' : ''} compact>
                          <select
                            value={fm.member_type ?? ''}
                            onChange={e => updateFamilyMember(i, 'member_type', e.target.value)}
                            className="reg-input"
                          >
                            <option value="">Select…</option>
                            <option value="adult">Adult</option>
                            <option value="child">Child</option>
                          </select>
                        </Field>
                        <button
                          type="button"
                          onClick={() => {
                            if (familyCount > 1) {
                              setFamilyMembers(prev => prev.filter((_, idx) => idx !== i));
                              setFamilyCount(c => c - 1);
                            } else {
                              updateFamilyMember(i, 'full_name', '');
                            }
                          }}
                          disabled={familyCount === 1}
                          aria-label={`Remove member ${i + 1}`}
                          style={{
                            width: '32px', height: '38px', borderRadius: '8px', border: 'none',
                            background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: familyCount === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: familyCount === 1 ? 0.3 : 1,
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Submit ── */}
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '16px 24px', borderRadius: '99px', border: 'none', cursor: submitting ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600,
                  background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))',
                  color: '#fff', boxShadow: '0 14px 36px rgba(62,200,200,0.3)',
                  opacity: submitting ? 0.75 : 1, transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(62,200,200,0.4)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 14px 36px rgba(62,200,200,0.3)'; }}
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <>Save & Continue to Payment <ArrowRight size={18} /></>}
              </button>
              <p style={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-soft)', fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--uid-teal)' }} /> Your information is securely stored and never shared.
              </p>
            </div>
          </form>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-soft)', fontWeight: 300 }}>
              Already a member? <Link to="/login" style={{ color: 'var(--uid-teal-dark)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .reg-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem 1.25rem;
          margin-bottom: 0.5rem;
        }
        .reg-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 10px;
          border: 1.5px solid rgba(13,77,124,0.15);
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--uid-dark);
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .reg-input:focus { border-color: var(--uid-teal); }
        .reg-input::placeholder { color: var(--text-soft); opacity: 0.6; }
        .family-row { grid-template-columns: minmax(0,2fr) 0.7fr 1fr 1fr 32px !important; }
        @media (max-width: 640px) {
          .reg-grid { grid-template-columns: 1fr; }
          .family-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Field wrapper ──
function Field({
  label, error, required, full, compact, children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      {label && (
        <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--uid-navy)', marginBottom: compact ? '0' : '0.375rem' }}>
          {label} {required && <span style={{ color: 'var(--uid-teal)' }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <p style={{ margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#dc2626', fontWeight: 400 }}>{error}</p>
      )}
    </div>
  );
}

// ── Section title ──
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.125rem', marginTop: '0.5rem' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(62,200,200,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--uid-teal-dark)', flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--uid-navy)', letterSpacing: '0.3px' }}>{title}</h3>
    </div>
  );
}

// ── Toggle chip ──
function ToggleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem', borderRadius: '99px',
        border: `1.5px solid ${active ? 'var(--uid-teal)' : 'rgba(13,77,124,0.15)'}`,
        background: active ? 'rgba(62,200,200,0.10)' : '#fff',
        color: active ? 'var(--uid-teal-dark)' : 'var(--text-mid)',
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
        transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}
    >
      {active && <CheckCircle2 size={15} />} {label}
    </button>
  );
}

// ── Count button style ──
function countBtn(disabled: boolean): React.CSSProperties {
  return {
    width: '36px', height: '38px', border: 'none', background: 'transparent',
    color: disabled ? 'var(--text-soft)' : 'var(--uid-navy)',
    fontSize: '18px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  };
}
