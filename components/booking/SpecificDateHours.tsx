'use client';

import { useId, useState } from 'react';
import { DateTime } from 'luxon';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Delete } from '@/components/shared/ActionButtons/Delete';
import styles from './booking.module.css';

type DateRule = { id: string; specific_date: string | null; start_time: string; end_time: string; unavailable: boolean };

export default function SpecificDateHours({ date, rules, disabled, save, addDisabledReason = '' }: {
  date: string;
  rules: DateRule[];
  disabled: boolean;
  addDisabledReason?: string;
  save: (body: object) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const noticeId = useId();
  const dateRules = rules.filter(rule => rule.specific_date === date).sort((first, second) => first.start_time.localeCompare(second.start_time));
  const selectedRule = dateRules.find(rule => rule.id === editing);
  const dateLabel = DateTime.fromISO(date).toFormat('d LLL yyyy');
  const blocked = dateRules.some(rule => rule.unavailable);
  return <div className={styles.dateRules}>
    <div className={styles.row}><h3 className="grow text-base font-medium">{dateLabel}</h3><button type="button" className={styles.icon} title={addDisabledReason || 'Add date-specific hours'} aria-label="Add date-specific hours" aria-describedby={addDisabledReason ? noticeId : undefined} disabled={disabled || editing !== null || Boolean(addDisabledReason)} onClick={() => { setEditing('new'); setClosed(false); }}><Plus size={18} /></button></div>
    {addDisabledReason && <p id={noticeId} className={`${styles.slotNotice} ${styles.infoSlotNotice}`} role="status">{addDisabledReason}</p>}
    {!dateRules.length && !addDisabledReason && <p className={styles.muted}>No date-specific changes. Weekly hours apply.</p>}
    {blocked && dateRules.some(rule => !rule.unavailable) && <p className={styles.muted}>Closed all day. Saved time ranges stay unavailable until the all-day closure is removed.</p>}
    {dateRules.map((rule, index) => <div key={rule.id} className={`${styles.weeklyDay} ${styles.dateRule}`} data-closed={rule.unavailable}>
      <button type="button" className={styles.weeklyEdit} disabled={disabled} title={`Edit ${dateLabel} range ${index + 1}`} aria-label={`Edit ${dateLabel} range ${index + 1}`} onClick={() => { setEditing(rule.id); setClosed(rule.unavailable); }}><span>{rule.unavailable ? 'Closed All Day' : `${rule.start_time.slice(0, 5)} - ${rule.end_time.slice(0, 5)}`}</span><Pencil size={16} /></button>
      <Delete title={`${dateLabel} range ${index + 1}`} confirmationTitle={rule.unavailable ? 'Remove All-Day Closure?' : 'Remove Date-Specific Hours?'} description={dateRules.length === 1 ? 'Removing this last date-specific rule restores the weekly hours for this date.' : rule.unavailable ? 'Other saved rules for this date will remain. Any remaining all-day closure will still keep the date closed.' : 'Only this time range will be removed. Other saved rules for this date will remain.'} variant="admin" disabled={disabled} onConfirm={async () => {
        const saved = await save({ action: 'delete_availability', id: rule.id });
        if (saved && editing === rule.id) setEditing(null);
        return saved;
      }} trigger={<button type="button" className={styles.icon} disabled={disabled} title={`Remove ${dateLabel} range ${index + 1}`} aria-label={`Remove ${dateLabel} range ${index + 1}`}><Trash2 size={16} /></button>} />
    </div>)}
    {editing !== null && <form key={editing} className={`${styles.weeklyDay} ${styles.dateRule}`} data-closed={closed} aria-label={`Edit ${dateLabel} hours`} onSubmit={async event => {
      event.preventDefault();
      if (disabled || (!selectedRule && addDisabledReason)) return;
      const form = new FormData(event.currentTarget);
      const times = { start_time: closed ? '00:00' : form.get('start'), end_time: closed ? '23:59' : form.get('end'), unavailable: closed };
      const body = selectedRule ? { action: 'update_date_time', id: selectedRule.id, ...times } : { action: 'availability', rule: { weekday: null, specific_date: date, ...times } };
      if (await save(body)) setEditing(null);
    }}>
      <label className={`${styles.check} ${styles.dateClosed}`}><input type="checkbox" checked={closed} disabled={disabled} onChange={event => setClosed(event.target.checked)} />Closed all day</label>
      <div className={styles.weeklyTime}>
        {!closed && <><label className={styles.field}>From<input type="time" name="start" className={styles.input} required disabled={disabled} defaultValue={selectedRule && !selectedRule.unavailable ? selectedRule.start_time.slice(0, 5) : '09:00'} /></label><label className={styles.field}>Until<input type="time" name="end" className={styles.input} required disabled={disabled} defaultValue={selectedRule && !selectedRule.unavailable ? selectedRule.end_time.slice(0, 5) : '17:00'} /></label></>}
        <div className={styles.weeklyTimeActions}>
          <button className={styles.icon} disabled={disabled || (!selectedRule && Boolean(addDisabledReason))} title="Save date-specific hours" aria-label="Save date-specific hours"><Save size={18} /></button>
          <button type="button" className={styles.icon} disabled={disabled} title="Cancel editing" aria-label="Cancel editing" onClick={() => setEditing(null)}><X size={18} /></button>
        </div>
      </div>
    </form>}
  </div>;
}