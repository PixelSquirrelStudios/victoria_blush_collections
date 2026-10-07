'use client';

import { useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Delete } from '@/components/shared/ActionButtons/Delete';
import styles from './booking.module.css';

type WeeklyRule = { id: string; weekday: number | null; start_time: string; end_time: string; unavailable: boolean };
type SaveHours = (body: object) => Promise<boolean>;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function WeeklyDay({ weekday, rules, disabled, save }: { weekday: number; rules: WeeklyRule[]; disabled: boolean; save: SaveHours }) {
  const [editing, setEditing] = useState<string | null>(null);
  const closed = !rules.some(rule => !rule.unavailable);
  const day = days[weekday];
  const editedRule = rules.find(rule => rule.id === editing);
  return <section className={styles.weeklyDay} data-closed={closed} aria-label={`${day} hours`}>
    <h3>{day}</h3>
    <div className={styles.weeklyRanges}>
      {closed ? <span className={styles.muted}>Closed</span> : rules.map((rule, index) => <div className={styles.weeklyRange} key={rule.id}>
        <button type="button" className={styles.weeklyEdit} disabled={disabled} title={`Edit ${day} time range ${index + 1}`} aria-label={`Edit ${day} time range ${index + 1}`} onClick={() => setEditing(rule.id)}><span>{rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}</span><Pencil size={14} /></button>
        <Delete title={`${day} time range ${index + 1}`} confirmationTitle={`Remove ${day} Time Range?`} description={rules.some(other => other.id !== rule.id && !other.unavailable) ? 'Only this time range will be removed. This day will stay open during its remaining hours.' : 'This is the last open time range. Removing it will close this day. Specific-date availability is unchanged.'} variant="admin" disabled={disabled} onConfirm={() => save({ action: 'delete_availability', id: rule.id })} trigger={<button type="button" className={styles.icon} disabled={disabled} title={`Remove ${day} time range ${index + 1}`} aria-label={`Remove ${day} time range ${index + 1}`}><Trash2 size={16} /></button>} />
      </div>)}
    </div>
    <div className={styles.weeklyDayActions}>
      <label className={styles.check}><input type="checkbox" checked={!closed} disabled={disabled} aria-label={`${day} open`} onChange={async event => {
        if (await save({ action: 'weekly_day', weekday, closed: !event.target.checked })) setEditing(null);
      }} />Open</label>
      <button type="button" className={styles.icon} disabled={disabled || closed || editing !== null} title={`Add ${day} time range`} aria-label={`Add ${day} time range`} onClick={() => setEditing('new')}><Plus size={18} /></button>
    </div>
    {editing !== null && !closed && <form key={editing} className={styles.weeklyTime} aria-label={`Edit ${day} hours`} onSubmit={async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const times = { start_time: form.get('start'), end_time: form.get('end') };
      const body = editedRule ? { action: 'update_weekly_time', id: editedRule.id, ...times } : { action: 'availability', rule: { weekday, specific_date: null, ...times, unavailable: false } };
      if (await save(body)) setEditing(null);
    }}>
      <label className={styles.field}>From<input className={styles.input} type="time" name="start" required defaultValue={editedRule?.start_time.slice(0, 5) ?? '09:00'} disabled={disabled} /></label>
      <label className={styles.field}>Until<input className={styles.input} type="time" name="end" required defaultValue={editedRule?.end_time.slice(0, 5) ?? '17:00'} disabled={disabled} /></label>
      <div className={styles.weeklyTimeActions}>
        <button className={styles.icon} disabled={disabled} title={`Save ${day} hours`} aria-label={`Save ${day} hours`}><Save size={18} /></button>
        <button type="button" className={styles.icon} disabled={disabled} title="Cancel editing" aria-label="Cancel editing" onClick={() => setEditing(null)}><X size={18} /></button>
      </div>
    </form>}
  </section>;
}

export default function WeeklyHours({ rules, disabled, save }: { rules: WeeklyRule[]; disabled: boolean; save: SaveHours }) {
  return <div className={styles.weeklyHours}>{[1, 2, 3, 4, 5, 6, 0].map(weekday => <WeeklyDay key={weekday} weekday={weekday} rules={rules.filter(rule => rule.weekday === weekday).sort((first, second) => first.start_time.localeCompare(second.start_time))} disabled={disabled} save={save} />)}</div>;
}