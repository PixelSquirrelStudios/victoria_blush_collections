'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, ArrowDown, ArrowLeft, ArrowUp, GripVertical, Pencil, Plus, Save } from 'lucide-react';
import { Delete } from '@/components/shared/ActionButtons/Delete';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TINY_MCE_CLOUDFLARE_URL } from '@/constants';
import { deleteSection, reorderSections, saveSection } from '@/lib/actions/section.actions';
import { sectionSchema, type PageSection, type SectionInput, type SectionType } from '@/lib/sections';
import { showCustomToast } from '@/components/shared/CustomToast';

function emptySection(type: SectionType): SectionInput {
  return { type, heading: '', copy: '', has_cta: false, cta_text: '', cta_link: '', background_colour: 'white', position: 'centre' };
}

const positionOptions = [
  { value: 'left', label: 'Left', icon: AlignHorizontalJustifyStart },
  { value: 'centre', label: 'Centre', icon: AlignHorizontalJustifyCenter },
  { value: 'right', label: 'Right', icon: AlignHorizontalJustifyEnd },
] as const;

interface RowProps {
  section: PageSection;
  index: number;
  count: number;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => Promise<boolean>;
  onMove: (offset: number) => void;
}

function SectionRow({ section, index, count, disabled, onEdit, onDelete, onMove }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: section.id, disabled });
  const position = positionOptions.find((option) => option.value === section.position) ?? positionOptions[1];
  const PositionIcon = position.icon;
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative flex flex-wrap items-center gap-3 rounded-lg border border-border-default bg-white p-4 ${isDragging ? 'z-10 shadow-lg' : ''}`}>
      <Button ref={setActivatorNodeRef} {...attributes} {...listeners} type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`Reorder ${section.heading}`} title="Drag to reorder" className="shrink-0 touch-none cursor-grab"><GripVertical className="size-5" /></Button>
      <div className="min-w-0 flex-1 basis-40">
        <p className="font-medium wrap-break-word">{section.heading}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2"><span className={`inline-block size-3 shrink-0 rounded-xs border border-border-emphasis ${section.background_colour === 'green' ? 'bg-bg-section' : 'bg-white'}`} />{section.background_colour === 'green' ? 'Green' : 'White'}</span>
          <span className="inline-flex items-center gap-2"><span aria-hidden="true">|</span><Badge title={`Position: ${position.label}`} className="bg-brand-primary text-text-primary uppercase"><PositionIcon aria-hidden="true" /><span>{position.label}</span></Badge></span>
          {section.has_cta && <span className="inline-flex items-center gap-2"><span aria-hidden="true">|</span><Badge>Includes CTA</Badge></span>}
        </div>
      </div>
      <div className="flex w-full shrink-0 justify-end gap-1 sm:w-auto">
        <Button type="button" variant="ghost" size="icon" title="Move up" aria-label={`Move up: ${section.heading}`} disabled={disabled || index === 0} onClick={() => onMove(-1)}><ArrowUp className="size-4" /></Button>
        <Button type="button" variant="ghost" size="icon" title="Move down" aria-label={`Move down: ${section.heading}`} disabled={disabled || index === count - 1} onClick={() => onMove(1)}><ArrowDown className="size-4" /></Button>
        <Button type="button" variant="ghost" size="icon" title="Edit section" aria-label={`Edit: ${section.heading}`} disabled={disabled} onClick={onEdit} className="rounded-lg bg-interactive-active/15 text-interactive-active transition-colors duration-300 hover:bg-interactive-active/25 hover:text-text-primary"><Pencil className="size-4" /></Button>
        <Delete title="Section" variant="admin" disabled={disabled} onConfirm={onDelete} />
      </div>
    </li>
  );
}

export default function SectionsManager({ initialSections, loadError }: { initialSections: PageSection[]; loadError?: string | null }) {
  const [sections, setSections] = useState(initialSections);
  const [pageType, setPageType] = useState<SectionType>('education');
  const [editing, setEditing] = useState<PageSection | 'new' | null>(null);
  const [values, setValues] = useState<SectionInput>(emptySection('education'));
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [editorReady, setEditorReady] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const initialValues = useRef<SectionInput>(emptySection('education'));
  const operationLock = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const visibleSections = sections.filter((section) => section.type === pageType).sort((first, second) => first.sort_order - second.sort_order || first.id.localeCompare(second.id));
  const disabled = busy || !!loadError;

  useEffect(() => {
    if (editing) headingRef.current?.focus();
  }, [editing]);

  function edit(section: PageSection | 'new') {
    const nextValues = section === 'new' ? emptySection(pageType) : { ...section, position: section.position ?? 'centre' };
    initialValues.current = nextValues;
    setValues(nextValues);
    setFormError('');
    setEditorReady(false);
    setEditorError(false);
    setEditing(section);
  }

  function cancelEditing() {
    const hasChanges = (Object.keys(emptySection('education')) as (keyof SectionInput)[]).some((key) => values[key] !== initialValues.current[key]);
    if (hasChanges) setDiscardOpen(true);
    else setEditing(null);
  }

  async function perform(operation: () => Promise<void>) {
    if (operationLock.current) return false;
    operationLock.current = true;
    setBusy(true);
    try {
      await operation();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save changes. Please try again.';
      setFormError(message);
      showCustomToast({ title: 'Error', message, variant: 'error' });
      return false;
    } finally {
      operationLock.current = false;
      setBusy(false);
    }
  }

  async function move(oldIndex: number, newIndex: number) {
    if (disabled || editing || oldIndex < 0 || newIndex < 0 || newIndex >= visibleSections.length) return;
    await perform(async () => {
      const reordered = arrayMove(visibleSections, oldIndex, newIndex).map((section, index) => ({ ...section, sort_order: index }));
      const previous = sections;
      setSections([...sections.filter((section) => section.type !== pageType), ...reordered]);
      try {
        const result = await reorderSections(pageType, reordered.map((section) => section.id));
        if (result.error) throw new Error(result.error);
        showCustomToast({ title: 'Saved', message: 'Section order updated.', variant: 'success' });
      } catch (error) {
        setSections(previous);
        throw error;
      }
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    void move(visibleSections.findIndex((section) => section.id === active.id), visibleSections.findIndex((section) => section.id === over.id));
  }

  async function remove(section: PageSection) {
    return perform(async () => {
      const result = await deleteSection(section.id);
      if (result.error) throw new Error(result.error);
      setSections((current) => current.filter((item) => item.id !== section.id));
      showCustomToast({ title: 'Deleted', message: 'Section deleted.', variant: 'success' });
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || disabled || !editorReady) return;
    const parsed = sectionSchema.safeParse(values);
    if (!parsed.success) { setFormError(parsed.error.issues[0].message); return; }
    setFormError('');
    await perform(async () => {
      const result = await saveSection(parsed.data, editing === 'new' ? undefined : editing.id);
      if (result.error || !result.data) throw new Error(result.error || 'Unable to save section.');
      const saved = result.data;
      setSections((current) => [...current.filter((section) => section.id !== saved.id), saved]);
      setPageType(saved.type);
      setEditing(null);
      showCustomToast({ title: 'Saved', message: 'Section saved.', variant: 'success' });
    });
  }

  return (
    <div className="min-w-0 space-y-6 text-text-primary">
      {!editing && <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Label htmlFor="section-page-filter">Page</Label>
          <Select value={pageType} disabled={disabled} onValueChange={(type) => setPageType(type as SectionType)}>
            <SelectTrigger id="section-page-filter" className="min-w-44 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white text-text-primary"><SelectItem value="education" className="focus:bg-bg-section">Education</SelectItem></SelectContent>
          </Select>
        </div>
        <Button type="button" disabled={disabled || !!editing} onClick={() => edit('new')} className="bg-interactive-active text-white hover:bg-bg-dark"><Plus className="mr-2 size-4" />Add Section</Button>
      </div>
      {loadError && <p role="alert" className="text-red-700">Unable to load sections: {loadError}</p>}
      {!loadError && visibleSections.length === 0 && <p className="py-8 text-text-secondary">No sections yet.</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visibleSections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <ol aria-label={`${pageType} sections`} aria-busy={busy} className="flex flex-col gap-3">
            {visibleSections.map((section, index) => <SectionRow key={section.id} section={section} index={index} count={visibleSections.length} disabled={disabled} onEdit={() => edit(section)} onDelete={() => remove(section)} onMove={(offset) => void move(index, index + offset)} />)}
          </ol>
        </SortableContext>
      </DndContext>
      </>}
      {editing && (
        <form onSubmit={submit}>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Button type="button" variant="outline" disabled={busy} onClick={cancelEditing} className="bg-brand-primary text-text-primary hover:bg-brand-primary/90"><ArrowLeft className="size-4" />Back to Sections</Button>
            <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-xl font-semibold">{editing === 'new' ? 'Add Section' : 'Edit Section'}</h2>
          </div>
          <fieldset disabled={busy} className="min-w-0 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="section-type">Type</Label>
              <Select value={values.type} disabled={busy} onValueChange={(type) => setValues({ ...values, type: type as SectionType })}>
                <SelectTrigger id="section-type" className="w-full bg-white sm:w-64"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white text-text-primary"><SelectItem value="education" className="focus:bg-bg-section">Education</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="section-heading">Heading</Label><Input id="section-heading" required maxLength={500} value={values.heading} onChange={(event) => setValues({ ...values, heading: event.target.value })} className="bg-white" /></div>
            <div className="space-y-2">
              <Label id="section-position-label">Position</Label>
              <RadioGroup aria-labelledby="section-position-label" value={values.position} disabled={busy} onValueChange={(position) => setValues({ ...values, position: position as SectionInput['position'] })} className="grid w-full max-w-sm grid-cols-3 gap-1 rounded-md bg-brand-primary p-1">
                {positionOptions.map(({ value, label, icon: Icon }) => <div key={value} className="relative min-w-0">
                  <RadioGroupItem id={`section-position-${value}`} value={value} className="peer sr-only" />
                  <Label htmlFor={`section-position-${value}`} className="flex min-h-10 cursor-pointer flex-wrap items-center justify-center gap-2 rounded-sm px-2 py-2 text-text-primary peer-data-[state=checked]:bg-interactive-active peer-data-[state=checked]:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-interactive-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                    <Icon aria-hidden="true" className="size-4 shrink-0" />{label}
                  </Label>
                </div>)}
              </RadioGroup>
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="section-copy">Copy</Label>
              {!editorReady && !editorError && <p role="status">Loading editor...</p>}
              {editorError && <p role="alert" className="text-red-700">The editor could not load. Check your connection and reload the page.</p>}
              <Editor id="section-copy" key={editing === 'new' ? 'new' : editing.id} tinymceScriptSrc={TINY_MCE_CLOUDFLARE_URL} licenseKey="gpl" initialValue={editing === 'new' ? '' : editing.copy} disabled={busy} onInit={(_event, editor) => {
                const copy = editor.getContent();
                initialValues.current = { ...initialValues.current, copy };
                setValues((current) => ({ ...current, copy }));
                setEditorReady(true);
              }} onScriptsLoadError={() => setEditorError(true)} onEditorChange={(copy) => setValues((current) => ({ ...current, copy }))} init={{
                height: 440, menubar: false, browser_spellcheck: true, contextmenu: false,
                plugins: ['advlist', 'autolink', 'lists', 'link', 'preview', 'wordcount'],
                toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist blockquote | link | preview',
                block_formats: 'Paragraph=p;Heading 3=h3;Heading 4=h4',
                iframe_aria_text: 'Section copy rich text editor',
                content_style: 'body { font-family: Georgia, serif; font-size: 18px; line-height: 1.7; padding: 1rem; color: #333; }',
                skin: 'oxide', content_css: 'default',
              }} />
            </div>
            <fieldset className="space-y-3">
              <legend id="section-colour-label" className="text-sm font-medium">Background Colour</legend>
              <RadioGroup aria-labelledby="section-colour-label" value={values.background_colour} disabled={busy} onValueChange={(colour) => setValues({ ...values, background_colour: colour as SectionInput['background_colour'] })} className="flex flex-wrap gap-5">
                {(['white', 'green'] as const).map((colour) => <div key={colour} className="flex flex-col items-center gap-2">
                  <RadioGroupItem id={`section-colour-${colour}`} value={colour} className={`size-7 cursor-pointer rounded-md border-2 text-text-primary shadow-sm transition-shadow data-[state=checked]:ring-2 data-[state=checked]:ring-interactive-active data-[state=checked]:ring-offset-2 [&_svg]:text-text-primary ${colour === 'green' ? 'bg-bg-section' : 'bg-white'}`} />
                  <Label htmlFor={`section-colour-${colour}`} className="cursor-pointer">{colour === 'green' ? 'Green' : 'White'}</Label>
                </div>)}
              </RadioGroup>
            </fieldset>
            <div className="flex items-center gap-3"><Switch id="section-has-cta" checked={values.has_cta} onCheckedChange={(has_cta) => setValues({ ...values, has_cta })} disabled={busy} /><Label htmlFor="section-has-cta">Show CTA Button</Label></div>
            {values.has_cta && <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="section-cta-text">Button Text</Label><Input id="section-cta-text" required maxLength={200} value={values.cta_text} onChange={(event) => setValues({ ...values, cta_text: event.target.value })} className="bg-white" /></div>
              <div className="space-y-2"><Label htmlFor="section-cta-link">Button Link</Label><Input id="section-cta-link" required maxLength={2000} value={values.cta_link} onChange={(event) => setValues({ ...values, cta_link: event.target.value })} placeholder="https://..." className="bg-white" /></div>
            </div>}
            {formError && <p role="alert" className="text-red-700">{formError}</p>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={disabled || !editorReady} className="bg-interactive-active text-white hover:bg-bg-dark"><Save className="mr-2 size-4" />{busy ? 'Saving...' : 'Save Section'}</Button>
              <Button type="button" variant="outline" disabled={busy} onClick={cancelEditing} className="bg-brand-primary text-text-primary hover:bg-brand-primary/90">Cancel</Button>
            </div>
          </fieldset>
        </form>
      )}
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="bg-white text-text-primary">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">Your section changes have not been saved. Discard them to return to the section list.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-500/85" onClick={() => setEditing(null)}>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}