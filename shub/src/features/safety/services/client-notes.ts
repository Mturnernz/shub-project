import { supabase } from '../../../lib/supabase';

export interface ClientNote {
  id: string;
  worker_id: string;
  client_id: string;
  booking_id?: string;
  content: string;
  safety_flag: 'none' | 'caution' | 'avoid';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientNoteSummary {
  client_id: string;
  client_name: string;
  total_bookings: number;
  note_count: number;
  latest_safety_flag: 'none' | 'caution' | 'avoid';
  latest_note?: string;
  last_booking_date?: string;
}

/**
 * Create a private note about a client
 * Only visible to the worker who created it
 */
export const createClientNote = async (
  workerId: string,
  clientId: string,
  content: string,
  safetyFlag: 'none' | 'caution' | 'avoid' = 'none',
  tags: string[] = [],
  bookingId?: string
): Promise<{ success: boolean; note?: ClientNote; error?: string }> => {
  try {
    // Store in admin_audit as a structured record
    // In production, this would use a dedicated client_notes table
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const note: ClientNote = {
      id: noteId,
      worker_id: workerId,
      client_id: clientId,
      booking_id: bookingId,
      content,
      safety_flag: safetyFlag,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('admin_audit').insert({
      admin_id: workerId,
      action: 'client_note_created',
      target_type: 'user',
      target_id: clientId,
      details: { note },
    });

    if (error) throw error;

    return { success: true, note };
  } catch (error: any) {
    console.error('Error creating client note:', error);
    return { success: false, error: error.message || 'Failed to create note' };
  }
};

/**
 * Get all notes a worker has written about a specific client
 */
export const getClientNotes = async (
  workerId: string,
  clientId: string
): Promise<{ success: boolean; notes: ClientNote[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('admin_audit')
      .select('details, created_at')
      .eq('admin_id', workerId)
      .eq('action', 'client_note_created')
      .eq('target_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const notes: ClientNote[] = (data || [])
      .map((row) => (row.details as any)?.note)
      .filter(Boolean);

    return { success: true, notes };
  } catch (error: any) {
    console.error('Error fetching client notes:', error);
    return { success: false, notes: [], error: error.message };
  }
};

/**
 * Update an existing client note
 */
export const updateClientNote = async (
  workerId: string,
  noteId: string,
  updates: {
    content?: string;
    safety_flag?: 'none' | 'caution' | 'avoid';
    tags?: string[];
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Log the update (append-only audit trail)
    await supabase.from('admin_audit').insert({
      admin_id: workerId,
      action: 'client_note_updated',
      target_type: 'note',
      target_id: noteId,
      details: {
        updates,
        updated_at: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating client note:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all clients a worker has notes about (summary view)
 */
export const getWorkerClientNotes = async (
  workerId: string
): Promise<{ success: boolean; summaries: ClientNoteSummary[]; error?: string }> => {
  try {
    // Get all notes by this worker
    const { data, error } = await supabase
      .from('admin_audit')
      .select('target_id, details, created_at')
      .eq('admin_id', workerId)
      .eq('action', 'client_note_created')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by client
    const clientMap = new Map<string, ClientNote[]>();
    for (const row of data || []) {
      const note = (row.details as any)?.note as ClientNote;
      if (!note) continue;
      const existing = clientMap.get(note.client_id) || [];
      existing.push(note);
      clientMap.set(note.client_id, existing);
    }

    // Get client names
    const clientIds = Array.from(clientMap.keys());
    const { data: clients } = await supabase
      .from('users')
      .select('id, name')
      .in('id', clientIds);

    const clientNameMap = new Map<string, string>();
    for (const client of clients || []) {
      clientNameMap.set(client.id, client.name);
    }

    // Build summaries
    const summaries: ClientNoteSummary[] = [];
    for (const [clientId, notes] of clientMap) {
      const latestNote = notes[0]; // Already sorted desc
      const highestFlag = notes.reduce<'none' | 'caution' | 'avoid'>((max, n) => {
        if (n.safety_flag === 'avoid') return 'avoid';
        if (n.safety_flag === 'caution' && max !== 'avoid') return 'caution';
        return max;
      }, 'none');

      summaries.push({
        client_id: clientId,
        client_name: clientNameMap.get(clientId) || 'Unknown',
        total_bookings: 0, // Would join with bookings table in production
        note_count: notes.length,
        latest_safety_flag: highestFlag,
        latest_note: latestNote.content,
        last_booking_date: latestNote.created_at,
      });
    }

    return { success: true, summaries };
  } catch (error: any) {
    console.error('Error fetching worker client notes:', error);
    return { success: false, summaries: [], error: error.message };
  }
};

/**
 * Available tags for client notes
 */
export const CLIENT_NOTE_TAGS = [
  'respectful',
  'good communicator',
  'punctual',
  'repeat client',
  'hygiene concern',
  'boundary issues',
  'late',
  'no-show',
  'payment issues',
  'aggressive',
  'intoxicated',
  'disrespectful',
  'pushy',
] as const;
