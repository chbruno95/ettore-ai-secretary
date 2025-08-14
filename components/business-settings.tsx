"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Building, Clock, DollarSign, Camera, Music, Utensils } from "lucide-react"

interface BusinessSettingsProps {
  profile: any
}

const serviceTypes = [
  { id: "photography", label: "Photography", icon: Camera },
  { id: "videography", label: "Videography", icon: Camera },
  { id: "music", label: "Music/DJ", icon: Music },
  { id: "catering", label: "Catering", icon: Utensils },
  { id: "planning", label: "Wedding Planning", icon: Building },
  { id: "flowers", label: "Flowers & Decor", icon: Building },
]

export function BusinessSettings({ profile }: BusinessSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || "",
    business_type: profile?.business_type || "",
    services: profile?.services || [],
    business_hours: profile?.business_hours || "",
    website: profile?.website || "",
    instagram: profile?.instagram || "",
    pricing_info: profile?.pricing_info || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/business-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Business Settings Updated",
          description: "Your business information has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update business settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const updatedServices = checked
      ? [...formData.services, serviceId]
      : formData.services.filter((s: string) => s !== serviceId)
    handleChange("services", updatedServices)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Business Information
        </CardTitle>
        <CardDescription>Configure your business details and services offered.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                placeholder="Your Wedding Business"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={formData.business_type} onValueChange={(value) => handleChange("business_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photography">Photography Studio</SelectItem>
                  <SelectItem value="planning">Wedding Planning</SelectItem>
                  <SelectItem value="venue">Wedding Venue</SelectItem>
                  <SelectItem value="catering">Catering Service</SelectItem>
                  <SelectItem value="music">Music/Entertainment</SelectItem>
                  <SelectItem value="flowers">Florist</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Services Offered</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {serviceTypes.map((service) => {
                const Icon = service.icon
                return (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={formData.services.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                    />
                    <Label htmlFor={service.id} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {service.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_hours">Business Hours</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="business_hours"
                value={formData.business_hours}
                onChange={(e) => handleChange("business_hours", e.target.value)}
                placeholder="Mon-Fri 9AM-6PM, Sat 10AM-4PM"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                placeholder="@yourbusiness"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing_info">Pricing Information</Label>
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-3" />
              <Textarea
                id="pricing_info"
                value={formData.pricing_info}
                onChange={(e) => handleChange("pricing_info", e.target.value)}
                placeholder="Starting at $2,500 for wedding photography packages..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating..." : "Update Business Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
