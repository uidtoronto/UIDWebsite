import { supabase } from '../lib/supabase';
import type { RegistrationInput, FamilyMember } from '../types';

export interface SavedRegistration {
  memberId: string;
}

// Inserts a member row + any family_member rows in a single transaction-like flow.
// Returns the new member id so the caller can pass it to Stripe checkout metadata.
export async function saveRegistration(
  input: RegistrationInput,
): Promise<{ data: SavedRegistration | null; error: string | null }> {
  const memberRow = {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    birth_date: input.birth_date || null,
    mobile_phone: input.mobile_phone || null,
    address_line1: input.address_line1 || null,
    address_line2: input.address_line2 || null,
    city: input.city || null,
    province: input.province || null,
    postal_code: input.postal_code || null,
    country: input.country || null,
    membership_type: input.membership_type,
    is_family: input.is_family,
    payment_status: 'pending' as const,
    status: 'pending' as const,
  };

  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert(memberRow)
    .select('id')
    .maybeSingle();

  if (memberError) return { data: null, error: memberError.message };
  if (!member) return { data: null, error: 'Failed to create member record' };

  // Insert family members if any
  if (input.is_family && input.family_members && input.family_members.length > 0) {
    const rows: FamilyMember[] = input.family_members
      .filter(fm => fm.full_name.trim() !== '')
      .map(fm => ({
        member_id: member.id,
        full_name: fm.full_name,
        age: fm.age ?? null,
        gender: fm.gender ?? null,
        member_type: fm.member_type ?? null,
      }));

    if (rows.length > 0) {
      const { error: famError } = await supabase.from('family_members').insert(rows);
      if (famError) {
        // Best effort: surface the error; member row is already saved
        return { data: null, error: `Member saved, but family members failed: ${famError.message}` };
      }
    }
  }

  return { data: { memberId: member.id }, error: null };
}
