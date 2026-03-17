'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { useOpportunities } from '@/lib/contexts/opportunities-context'
import { getOpportunityById } from '@/lib/selectors/opportunities'
import { WORK_MODE_CONFIG } from '@/lib/constants'
import type { WorkMode } from '@/lib/types'
import { ArrowLeft, Link as LinkIcon, Building2, MapPin, Briefcase, FileText } from 'lucide-react'

interface EditOpportunityPageProps {
  params: Promise<{ id: string }>
}

interface FormErrors {
  sourceUrl?: string
  title?: string
  company?: string
  location?: string
  workMode?: string
}

export default function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { opportunities, updateOpportunity } = useOpportunities()

  const opportunity = useMemo(() => getOpportunityById(opportunities, id), [opportunities, id])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState(() => ({
    sourceUrl: opportunity?.sourceUrl ?? '',
    title: opportunity?.title ?? '',
    company: opportunity?.company ?? '',
    location: opportunity?.location ?? '',
    workMode: (opportunity?.workMode ?? '') as WorkMode | '',
    notes: opportunity?.notes ?? '',
  }))

  useEffect(() => {
    if (!opportunity) return
    setFormData({
      sourceUrl: opportunity.sourceUrl,
      title: opportunity.title,
      company: opportunity.company,
      location: opportunity.location,
      workMode: opportunity.workMode,
      notes: opportunity.notes,
    })
  }, [opportunity])

  if (!opportunity) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Opportunity not found.</p>
      </PageContainer>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.workMode) newErrors.workMode = 'Work mode is required'
    if (formData.sourceUrl && !isValidUrl(formData.sourceUrl)) {
      newErrors.sourceUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!formData.workMode) return

    setIsSubmitting(true)
    try {
      await updateOpportunity(id, {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        workMode: formData.workMode,
        sourceUrl: formData.sourceUrl,
        notes: formData.notes,
      })
      router.push(`/opportunities/${id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/opportunities/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunity
        </Link>
      </Button>

      <PageHeader title="Edit Opportunity" description="Update details for this opportunity" />

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="sourceUrl" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                Source URL
              </label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => updateField('sourceUrl', e.target.value)}
                className={errors.sourceUrl ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Job Title
              </label>
              <Input id="title" value={formData.title} onChange={(e) => updateField('title', e.target.value)} className={errors.title ? 'border-destructive' : ''} />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company
              </label>
              <Input id="company" value={formData.company} onChange={(e) => updateField('company', e.target.value)} className={errors.company ? 'border-destructive' : ''} />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </label>
              <Input id="location" value={formData.location} onChange={(e) => updateField('location', e.target.value)} className={errors.location ? 'border-destructive' : ''} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Work Mode</label>
              <Select value={formData.workMode} onValueChange={(value) => updateField('workMode', value as WorkMode)}>
                <SelectTrigger className={errors.workMode ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(WORK_MODE_CONFIG) as [WorkMode, { label: string }][]).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notes
              </label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={4} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/opportunities/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
