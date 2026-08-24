export interface Experience {
  id: string;
  name: string;
  video_url: string;
  image_url: string;
  likes: number;
  tags: string[];
  price: number;
  creator: string;
  description: string;
  is_experience: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface CreateExperienceDto {
  name: string;
  price: number;
  creator: string;
  description: string;
  video_url: string;
  image_url: string;
  tags: string[];
}

export interface UpdateExperienceDto {
  name?: string;
  price?: number;
  creator?: string;
  description?: string;
  video_url?: string;
  image_url?: string;
  tags?: string[];
}
