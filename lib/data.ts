export type GalleryImage = {
  id: string
  title: string
  category: string
  description: string
  imageUrl: string
  width: number
  height: number
  createdAt: string
}

export type Video = {
  id: string
  title: string
  category: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  createdAt: string
}

export type Project = {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string
  images: { url: string; caption: string }[]
  category: string
  date: string
}

export type Category = {
  id: string
  name: string
  slug: string
  imageCount: number
}

export const categories: Category[] = [
  { id: "1", name: "Weddings", slug: "weddings", imageCount: 6 },
  { id: "2", name: "Portraits", slug: "portraits", imageCount: 5 },
  { id: "3", name: "Travel", slug: "travel", imageCount: 5 },
  { id: "4", name: "Events", slug: "events", imageCount: 4 },
]

export const galleryImages: GalleryImage[] = [
  {
    id: "1",
    title: "Golden Hour Ceremony",
    category: "Weddings",
    description: "A beautiful sunset ceremony captured during the golden hour.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1200&fit=crop",
    width: 800,
    height: 1200,
    createdAt: "2025-12-15",
  },
  {
    id: "2",
    title: "First Dance",
    category: "Weddings",
    description: "The magical first dance under a canopy of lights.",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-12-10",
  },
  {
    id: "3",
    title: "Bridal Portrait",
    category: "Weddings",
    description: "An elegant bridal portrait with natural light.",
    imageUrl: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=1100&fit=crop",
    width: 800,
    height: 1100,
    createdAt: "2025-11-20",
  },
  {
    id: "4",
    title: "Venice Canal Reflections",
    category: "Travel",
    description: "Moody reflections in the canals of Venice at dusk.",
    imageUrl: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&h=1200&fit=crop",
    width: 800,
    height: 1200,
    createdAt: "2025-11-15",
  },
  {
    id: "5",
    title: "Mountain Solitude",
    category: "Travel",
    description: "A lone traveler overlooking a misty mountain range.",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-11-10",
  },
  {
    id: "6",
    title: "The Storyteller",
    category: "Portraits",
    description: "A candid portrait capturing raw emotion and character.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    width: 800,
    height: 1000,
    createdAt: "2025-10-28",
  },
  {
    id: "7",
    title: "Rings of Promise",
    category: "Weddings",
    description: "Elegant wedding ring details on a vintage book.",
    imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-10-20",
  },
  {
    id: "8",
    title: "Desert Wanderer",
    category: "Travel",
    description: "Ethereal sand dunes bathed in soft morning light.",
    imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=1200&fit=crop",
    width: 800,
    height: 1200,
    createdAt: "2025-10-15",
  },
  {
    id: "9",
    title: "Corporate Gala",
    category: "Events",
    description: "Sophisticated lighting at a high-end corporate event.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-10-10",
  },
  {
    id: "10",
    title: "Soul Window",
    category: "Portraits",
    description: "A close-up portrait with dramatic natural light.",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1100&fit=crop",
    width: 800,
    height: 1100,
    createdAt: "2025-10-05",
  },
  {
    id: "11",
    title: "Tokyo Nights",
    category: "Travel",
    description: "Neon-lit streets of Tokyo after midnight rain.",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=1200&fit=crop",
    width: 800,
    height: 1200,
    createdAt: "2025-09-28",
  },
  {
    id: "12",
    title: "Fashion Forward",
    category: "Portraits",
    description: "An editorial fashion portrait with bold styling.",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop",
    width: 800,
    height: 1200,
    createdAt: "2025-09-20",
  },
  {
    id: "13",
    title: "Bouquet Toss",
    category: "Weddings",
    description: "The joyful moment of the bouquet toss.",
    imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-09-15",
  },
  {
    id: "14",
    title: "Music Festival",
    category: "Events",
    description: "Electric energy at a summer music festival.",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-09-10",
  },
  {
    id: "15",
    title: "Artist at Work",
    category: "Portraits",
    description: "A painter captured in their creative flow.",
    imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&h=1000&fit=crop",
    width: 800,
    height: 1000,
    createdAt: "2025-09-05",
  },
  {
    id: "16",
    title: "Charity Ball",
    category: "Events",
    description: "A glamorous charity gala under crystal chandeliers.",
    imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-08-28",
  },
  {
    id: "17",
    title: "Santorini Sunset",
    category: "Travel",
    description: "Iconic blue domes silhouetted against a fiery sunset.",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=1200&fit=crop",
    width: 800,
    height: 1200,
    createdAt: "2025-08-20",
  },
  {
    id: "18",
    title: "Garden Reception",
    category: "Weddings",
    description: "An enchanting garden reception with fairy lights.",
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-08-15",
  },
  {
    id: "19",
    title: "Product Launch",
    category: "Events",
    description: "A sleek product launch event with dramatic lighting.",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop",
    width: 1200,
    height: 800,
    createdAt: "2025-08-10",
  },
  {
    id: "20",
    title: "Silent Strength",
    category: "Portraits",
    description: "A powerful black and white environmental portrait.",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1100&fit=crop",
    width: 800,
    height: 1100,
    createdAt: "2025-08-05",
  },
]

export const videos: Video[] = [
  {
    id: "v1",
    title: "Sarah & James - Wedding Film",
    category: "Weddings",
    description: "A cinematic wedding film capturing the love story of Sarah and James.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=340&fit=crop",
    createdAt: "2025-12-01",
  },
  {
    id: "v2",
    title: "Tokyo After Dark - Travel Reel",
    category: "Travel",
    description: "Exploring the vibrant nightlife and culture of Tokyo.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=340&fit=crop",
    createdAt: "2025-11-15",
  },
  {
    id: "v3",
    title: "Elena - Portrait Session BTS",
    category: "Portraits",
    description: "Behind the scenes of a dramatic portrait session.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=340&fit=crop",
    createdAt: "2025-10-20",
  },
  {
    id: "v4",
    title: "Venice Golden Hour",
    category: "Travel",
    description: "A cinematic journey through Venice during the golden hour.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600&h=340&fit=crop",
    createdAt: "2025-09-15",
  },
  {
    id: "v5",
    title: "Annual Gala 2025 - Highlights",
    category: "Events",
    description: "Highlights from the most prestigious gala of the year.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=340&fit=crop",
    createdAt: "2025-08-20",
  },
  {
    id: "v6",
    title: "Mia & David - Love Story",
    category: "Weddings",
    description: "A heartwarming love story told through cinematic visuals.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=340&fit=crop",
    createdAt: "2025-07-10",
  },
]

export const projects: Project[] = [
  {
    id: "p1",
    title: "The Anderson Wedding",
    slug: "anderson-wedding",
    description: "A breathtaking garden wedding set against rolling hills and golden sunlight. Every moment was carefully captured to tell the story of Sarah and James's beautiful day, from the intimate preparations to the grand celebration under the stars.",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop",
    images: [
      { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop", caption: "The ceremony" },
      { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=800&fit=crop", caption: "First dance" },
      { url: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=1100&fit=crop", caption: "Bridal portrait" },
      { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&h=800&fit=crop", caption: "Ring details" },
      { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=800&fit=crop", caption: "Joyful moments" },
      { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=800&fit=crop", caption: "Garden reception" },
    ],
    category: "Weddings",
    date: "December 2025",
  },
  {
    id: "p2",
    title: "Wanderlust: Mediterranean",
    slug: "wanderlust-mediterranean",
    description: "A visual journey through the sun-drenched landscapes and ancient architecture of the Mediterranean. From the blue domes of Santorini to the romantic canals of Venice, this series captures the timeless beauty of Southern Europe.",
    coverImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&h=800&fit=crop",
    images: [
      { url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&h=800&fit=crop", caption: "Santorini sunset" },
      { url: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&h=1200&fit=crop", caption: "Venice canals" },
      { url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=1200&fit=crop", caption: "Desert wanderer" },
      { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop", caption: "Mountain solitude" },
    ],
    category: "Travel",
    date: "October 2025",
  },
  {
    id: "p3",
    title: "Faces of the City",
    slug: "faces-of-the-city",
    description: "An intimate portrait series documenting the diverse faces and stories found in the heart of the city. Each subject reveals a unique narrative through expression, light, and environment.",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
    images: [
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop", caption: "The storyteller" },
      { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1100&fit=crop", caption: "Soul window" },
      { url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop", caption: "Fashion forward" },
      { url: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&h=1000&fit=crop", caption: "Artist at work" },
      { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1100&fit=crop", caption: "Silent strength" },
    ],
    category: "Portraits",
    date: "September 2025",
  },
]

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/projects", label: "Projects" },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export const adminStats = {
  totalImages: 20,
  totalVideos: 6,
  totalCategories: 4,
  totalViews: 12847,
  recentUploads: [
    { id: "1", title: "Golden Hour Ceremony", type: "image" as const, date: "2025-12-15" },
    { id: "v1", title: "Sarah & James - Wedding Film", type: "video" as const, date: "2025-12-01" },
    { id: "2", title: "First Dance", type: "image" as const, date: "2025-12-10" },
    { id: "3", title: "Bridal Portrait", type: "image" as const, date: "2025-11-20" },
    { id: "v2", title: "Tokyo After Dark", type: "video" as const, date: "2025-11-15" },
  ],
}
