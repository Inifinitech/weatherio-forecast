'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

type Props = {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  farmId: string;
  county?: string;
  landAcres?: number;
};

export function ImageUpload({ onSubmit, isLoading, farmId, county, landAcres }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && /\.(jpe?g|png|webp)$/i.test(f.name)) pickFile(f);
  }, []);

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);
    fd.append('farmId', farmId);
    if (county) fd.append('county', county);
    if (landAcres) fd.append('landAcres', String(landAcres));
    if (notes) fd.append('notes', notes);

    onSubmit(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={[
            'border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-14 cursor-pointer transition-colors',
            dragging
              ? 'border-green-500 bg-green-50'
              : 'border-border bg-canvas hover:border-green-400 hover:bg-green-50',
          ].join(' ')}
        >
          <Upload className="w-8 h-8 text-muted mb-3" />
          <p className="text-sm font-medium text-ink">Drop a farm image here or click to browse</p>
          <p className="text-xs text-muted mt-1">JPEG · PNG · WEBP · max 20 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Selected farm image"
              className="w-full max-h-64 object-cover"
            />
          )}
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={clearFile}
              className="p-1.5 bg-white rounded-full border border-border shadow-sm hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
          <div className="px-4 py-2 bg-white border-t border-border flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs text-ink font-medium">{file.name}</span>
            <span className="text-2xs text-muted ml-auto">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}

      {/* Optional notes */}
      <div>
        <label className="block text-xs text-muted mb-1">
          Notes for AI{' '}
          <span className="text-2xs normal-case">(optional — e.g. "tea plantation, recently pruned")</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any context that helps the model"
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={!file || isLoading}
        className="w-full py-2.5 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Analysing image…' : 'Analyse canopy'}
      </button>
    </form>
  );
}
