export interface AdmissionStats {
  gpa: number;
  sat: number;
  apClasses: number;
  extracurriculars: string;
}

export interface AdmissionScores {
  academics: number;
  leadership: number;
  impact: number;
  innovation: number;
  softSkills: number;
}

export interface UniversityMatch {
  tier: 'Safety' | 'Target' | 'Reach';
  universities: string[];
}

export interface AdmissionBlueprint {
  scores: AdmissionScores;
  recommendation: string;
  matches: UniversityMatch[];
}
