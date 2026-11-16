import { Bot, FileText, GitBranch, ClipboardList, PencilRuler, Headphones, BookOpen, Home, type LucideIcon } from 'lucide-react';

export type ToolId = 'overview' | 'chat' | 'pdf' | 'mindmap' | 'quiz' | 'whiteboard' | 'podcast' | 'exam' | 'audio' | 'papers';
export type NavigationItem = { id: ToolId; label: string; group: 'Workspace' | 'Create' | 'Practice'; icon: LucideIcon };
export const navigation: NavigationItem[] = [
  { id: 'overview', label: 'Overview', group: 'Workspace', icon: Home },
  { id: 'chat', label: 'AI Study Chat', group: 'Workspace', icon: Bot },
  { id: 'pdf', label: 'PDF Notes', group: 'Workspace', icon: FileText },
  { id: 'mindmap', label: 'Mind Map & Flowchart', group: 'Create', icon: GitBranch },
  { id: 'whiteboard', label: 'AI Whiteboard', group: 'Create', icon: PencilRuler },
  { id: 'podcast', label: 'Podcast & Voice Tutor', group: 'Create', icon: Headphones },
  { id: 'quiz', label: 'Quiz Generator', group: 'Practice', icon: ClipboardList },
  { id: 'exam', label: 'Model Question Papers', group: 'Practice', icon: BookOpen },
];
export const quizQuestions = [
  { question: 'Which operation is used to find the derivative of a product of two functions?', options: ['Chain rule', 'Product rule', 'Quotient rule', 'Power rule'], answer: 1, explanation: 'The product rule differentiates two multiplied functions: (uv)′ = u′v + uv′.' },
  { question: 'What does the determinant of a square matrix help determine?', options: ['Its trace only', 'Whether it is invertible', 'Its number of rows', 'Its diagonal entries'], answer: 1, explanation: 'A square matrix is invertible exactly when its determinant is non-zero.' },
  { question: 'Which data structure follows the LIFO principle?', options: ['Queue', 'Tree', 'Stack', 'Graph'], answer: 2, explanation: 'A stack uses Last In, First Out ordering.' },
  { question: 'In a directed graph, what does an edge represent?', options: ['A one-way relationship', 'A vertex colour', 'A matrix row', 'A weight only'], answer: 0, explanation: 'A directed edge has a specified direction from one vertex to another.' },
  { question: 'Which SQL clause filters grouped results?', options: ['WHERE', 'ORDER BY', 'HAVING', 'SELECT'], answer: 2, explanation: 'HAVING filters groups after GROUP BY has been applied.' },
];
