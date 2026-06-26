export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  coverImage: string;
  pages: number;
  fileSizeMb: number;
  tags: string[];
  description?: string;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
  previewUrl?: string;
  totalSales?: number;
  isFeatured?: boolean;
}

export const mockProducts: Product[] = [
  { 
    id: "1", 
    title: "Ultimate DSA Mastery Bundle", 
    slug: "dsa-mastery-bundle",
    category: "DSA & Algorithms", 
    price: 299, 
    originalPrice: 2999,
    coverImage: "/covers/placeholder.svg", 
    pages: 450, 
    fileSizeMb: 12.4,
    tags: ["DSA", "LeetCode", "Arrays", "Trees"] 
  },
  { 
    id: "2", 
    title: "MERN Full Stack Kit", 
    slug: "mern-full-stack-kit",
    category: "Web Development", 
    price: 299, 
    originalPrice: 1999,
    coverImage: "/covers/placeholder.svg", 
    pages: 380, 
    fileSizeMb: 9.8,
    tags: ["React", "Node.js", "MongoDB", "Express"] 
  },
  { 
    id: "3", 
    title: "System Design Bible", 
    slug: "system-design-bible",
    category: "System Design", 
    price: 349, 
    originalPrice: 2499,
    coverImage: "/covers/placeholder.svg", 
    pages: 290, 
    fileSizeMb: 8.1,
    tags: ["HLD", "LLD", "Scalability", "Microservices"] 
  },
  { 
    id: "4", 
    title: "SQL & Database Mastery", 
    slug: "sql-database-mastery",
    category: "Database & SQL", 
    price: 249, 
    originalPrice: 2999,
    coverImage: "/covers/placeholder.svg", 
    pages: 210, 
    fileSizeMb: 6.3,
    tags: ["SQL", "PostgreSQL", "Joins", "Indexing"] 
  },
  { 
    id: "5", 
    title: "Top 500 Interview Questions", 
    slug: "top-500-interview-questions",
    category: "Interview Prep", 
    price: 199, 
    originalPrice: 1499,
    coverImage: "/covers/placeholder.svg", 
    pages: 520, 
    fileSizeMb: 15.2,
    tags: ["Interview", "HR", "Technical", "Behavioral"] 
  },
  { 
    id: "6", 
    title: "Python + ML Complete Bundle", 
    slug: "python-ml-bundle",
    category: "Python & ML", 
    price: 299, 
    originalPrice: 2999,
    coverImage: "/covers/placeholder.svg", 
    pages: 410, 
    fileSizeMb: 11.7,
    tags: ["Python", "ML", "Pandas", "scikit-learn"] 
  }
];
