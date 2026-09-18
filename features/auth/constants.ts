// features/auth/constants.ts — academic constants and profile configuration

export const POPULAR_SCHOOLS = [
  "Achimota School",
  "Presbyterian Boys' Secondary School (PRESEC)",
  "Wesley Girls' High School",
  "Mfantsipim School",
  "Opoku Ware School",
  "Prempeh College",
  "Holy Child School",
  "St. Augustine's College",
  "Aburi Girls' Senior High School",
  "St. Peter's Boys' Senior High School",
  "Accra Academy",
  "Koforidua Senior High Technical School",
  "Yaa Asantewaa Girls' Senior High School",
  "Tamale Senior High School",
  "Ghana National College",
];

export const ACADEMIC_TRACKS = [
  "General Science Track",
  "General Arts Track",
  "Business Track",
  "Visual Arts Track",
  "Home Economics Track",
  "Agricultural Science Track",
  "Technical Track",
];

export interface CustomProfileState {
  name: string;
  school: string;
  track: string;
  avatarUrl?: string | null;
}
