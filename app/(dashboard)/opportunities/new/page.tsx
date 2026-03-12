'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { WORK_MODE_CONFIG } from '@/lib/constants'
import type { WorkMode, CreateOpportunityInput } from '@/lib/types'
import { ArrowLeft, Link as LinkIcon, Building2, MapPin, Briefcase, FileText } from 'lucide-react'


interface NewOpportunityFormData extends Omit<CreateOpportunityInput, 'workMode'> {
  workMode: WorkMode | ''
}

interface FormErrors {
  sourceUrl?: string
  title?: string
  company?: string
  location?: string
  workMode?: string
}

export default function NewOpportunityPage() {
  const router = useRouter()
  const { addOpportunity } = useOpportunities()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewOpportunityFormData>({
    sourceUrl: '',
    title: '',
    company: '',
    location: '',
    workMode: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.workMode) {
      newErrors.workMode = 'Work mode is required'
    }
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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Add opportunity using context
    await addOpportunity({
      title: formData.title,
      company: formData.company,
      location: formData.location,
      workMode: formData.workMode,
      sourceUrl: formData.sourceUrl,
      notes: formData.notes,
    })

    setIsSubmitting(false)
    router.push('/opportunities')
  }

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <PageContainer>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-4"
      >
        <Link href="/opportunities">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Link>
      </Button>

      <PageHeader
        title="Add Opportunity"
        description="Create a new job opportunity to track in your pipeline"
      />

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source URL */}
            <div className="space-y-2">
              <label
                htmlFor="sourceUrl"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                Source URL
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://company.com/jobs/position"
                value={formData.sourceUrl}
                onChange={(e) => updateField('sourceUrl', e.target.value)}
                className={errors.sourceUrl ? 'border-destructive' : ''}
              />
              {errors.sourceUrl && (
                <p className="text-sm text-destructive">{errors.sourceUrl}</p>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Job Title
                <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="e.g., Product Manager"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label
                htmlFor="company"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company
                <span className="text-destructive">*</span>
              </label>
              <Input
                id="company"
                placeholder="e.g., Acme Corp"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
                <span className="text-destructive">*</span>
              </label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <label
                htmlFor="workMode"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                Work Mode
                <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.workMode}
                onValueChange={(value) => updateField('workMode', value as WorkMode)}
              >
                <SelectTrigger
                  id="workMode"
                  className={errors.workMode ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(WORK_MODE_CONFIG) as [WorkMode, { label: string }][]).map(
                    ([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.workMode && (
                <p className="text-sm text-destructive">{errors.workMode}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notes
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this opportunity..."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Opportunity'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/opportunities">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
