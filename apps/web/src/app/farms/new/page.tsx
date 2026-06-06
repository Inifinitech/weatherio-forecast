'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { farmApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import type { CreateFarmInput } from '@fieldpulse/types';

const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

const CROP_TYPES = [
  'Tea', 'Coffee', 'Maize', 'Wheat', 'Rice', 'Sorghum', 'Beans',
  'Potatoes', 'Tomatoes', 'Sugarcane', 'Pyrethrum', 'Sunflower',
  'Pasture / Napier Grass', 'Horticulture (mixed)', 'Other',
];

type FormState = CreateFarmInput;

const INITIAL: FormState = {
  name: '',
  farmer: '',
  phone: '',
  county: '',
  lat: 0,
  lon: 0,
  landAcres: 0,
  cropType: '',
  notes: '',
};

export default function NewFarmPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const mutation = useMutation({
    mutationFn: (data: FormState) => farmApi.create(data),
    onSuccess: (farm) => {
      qc.invalidateQueries({ queryKey: ['farms'] });
      router.push(`/farms/${farm.id}`);
    },
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.farmer.trim()) next.farmer = 'Required';
    if (!form.phone.trim()) next.phone = 'Required';
    if (!form.county) next.county = 'Select a county';
    if (!form.cropType) next.cropType = 'Select a crop type';
    if (form.lat === 0 && form.lon === 0) next.lat = 'Enter coordinates';
    if (form.landAcres <= 0) next.landAcres = 'Must be greater than 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form);
  }

  return (
    <div>
      <PageHeader
        title="Register new farm"
        subtitle="Add a farm to the portfolio to enable weather forecasting, alerts, and canopy scanning."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Register farm' },
        ]}
      />

      <div className="px-8 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farmer details */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-muted uppercase tracking-widest pb-2 border-b border-border w-full">
              Farmer details
            </legend>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Farmer name"
                error={errors.farmer}
                required
              >
                <input
                  value={form.farmer}
                  onChange={(e) => set('farmer', e.target.value)}
                  className={input(!!errors.farmer)}
                  placeholder="John Kiprotich"
                />
              </Field>

              <Field label="Phone number" error={errors.phone} required>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={input(!!errors.phone)}
                  placeholder="+254712345678"
                  type="tel"
                />
              </Field>
            </div>
          </fieldset>

          {/* Farm details */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-muted uppercase tracking-widest pb-2 border-b border-border w-full">
              Farm details
            </legend>

            <Field label="Farm name" error={errors.name} required>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={input(!!errors.name)}
                placeholder="Kapkimolwa Farm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="County" error={errors.county} required>
                <select
                  value={form.county}
                  onChange={(e) => set('county', e.target.value)}
                  className={input(!!errors.county)}
                >
                  <option value="">Select county</option>
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Crop type" error={errors.cropType} required>
                <select
                  value={form.cropType}
                  onChange={(e) => set('cropType', e.target.value)}
                  className={input(!!errors.cropType)}
                >
                  <option value="">Select crop</option>
                  {CROP_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Land area (acres)"
              error={errors.landAcres}
              required
            >
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.landAcres || ''}
                onChange={(e) => set('landAcres', Number(e.target.value))}
                className={input(!!errors.landAcres)}
                placeholder="2.5"
              />
            </Field>
          </fieldset>

          {/* Location */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-muted uppercase tracking-widest pb-2 border-b border-border w-full">
              GPS coordinates
            </legend>
            <p className="text-xs text-muted -mt-2">
              Used for precise weather forecasting. Find coordinates from Google Maps or your GPS device.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" error={errors.lat} required>
                <input
                  type="number"
                  step="0.0001"
                  value={form.lat || ''}
                  onChange={(e) => set('lat', Number(e.target.value))}
                  className={input(!!errors.lat)}
                  placeholder="-0.7764"
                />
              </Field>

              <Field label="Longitude" error={errors.lon} required>
                <input
                  type="number"
                  step="0.0001"
                  value={form.lon || ''}
                  onChange={(e) => set('lon', Number(e.target.value))}
                  className={input(!!errors.lon)}
                  placeholder="35.3466"
                />
              </Field>
            </div>
          </fieldset>

          {/* Notes */}
          <fieldset>
            <legend className="text-xs font-semibold text-muted uppercase tracking-widest pb-2 border-b border-border w-full mb-4">
              Notes (optional)
            </legend>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              className={`${input(false)} resize-none`}
              placeholder="Any useful context — e.g. 'Tea plantation, Block A and B active. Northern section recently pruned.'"
            />
          </fieldset>

          {/* Error from server */}
          {mutation.isError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {mutation.error.message}
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-900 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? 'Registering…' : 'Register farm'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helpers
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function input(hasError: boolean) {
  return [
    'w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none transition-colors',
    hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-border focus:border-green-500',
  ].join(' ');
}
