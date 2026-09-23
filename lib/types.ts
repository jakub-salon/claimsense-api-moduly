import type { IndustryId, ProcessId } from "@/lib/taxonomy"

export type ResultField = {
  field: string
  meaning: string
}

export type ModuleDocument = {
  name: string
  role: string
}

export type ApiModule = {
  slug: string
  apiName: string
  method: "POST"
  path: string
  title: string
  summary: string
  process: ProcessId
  industries: IndustryId[]
  caller: string
  documents: ModuleDocument[]
  checks: string[]
  resultFields: ResultField[]
  whySeparate: string
  request: Record<string, unknown>
  response: Record<string, unknown>
  scenarioSlug?: string
  relatedSlugs?: string[]
}

export type Severity = "high" | "medium" | "low"

export type ScenarioDocument = {
  id: string
  name: string
  kind: string
  fields: { label: string; value: string; conflict?: boolean }[]
}

export type ScenarioCheck = {
  id: string
  label: string
  status: "pass" | "fail"
  documentIds: string[]
  detail: string
}

export type ScenarioDiscrepancy = {
  id: string
  severity: Severity
  title: string
  rows: { source: string; value: string }[]
  detail: string
}

export type Scenario = {
  slug: string
  moduleSlug: string
  industry: IndustryId
  title: string
  dek: string
  caller: {
    system: string
    product: string
    actor: string
    actorRole: string
    recordId: string
    recordTitle: string
  }
  recordFields: { label: string; value: string }[]
  documents: ScenarioDocument[]
  request: Record<string, unknown>
  checks: ScenarioCheck[]
  discrepancies: ScenarioDiscrepancy[]
  response: Record<string, unknown>
  writeback: { label: string; value: string }[]
  error: {
    status: number
    code: string
    message: string
    traceId: string
  }
}
