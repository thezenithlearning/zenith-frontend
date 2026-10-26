import { baseApi } from '../../../services/baseApi';
import type {
  CategoryRef,
  ItemResponse,
  ListResponse,
  Pagination,
  PublishFields,
  PublishInput,
} from '../../content/types';

export type QuestionType = 'single' | 'multiple';

export interface QuizOptionInput {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionInput {
  _id?: string;
  text: string;
  type: QuestionType;
  options: QuizOptionInput[];
  marks: number;
  negativeMarks: number;
  explanation?: string;
}

/** Admin view of a quiz (includes answers). */
export interface IQuizAdmin extends PublishFields {
  _id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  category: CategoryRef;
  seriesName: string;
  durationMinutes: number;
  defaultMarks: number;
  defaultNegativeMarks: number;
  passPercentage: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showAnswers: boolean;
  seoTitle: string;
  seoDescription: string;
  questions: (QuizQuestionInput & { _id: string })[];
  questionCount: number;
  totalMarks: number;
  attemptCount: number;
  createdAt: string;
}

/** Summary row used by list endpoints. */
export interface IQuizSummary extends Partial<PublishFields> {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryRef;
  seriesName: string;
  durationMinutes: number;
  questionCount: number;
  totalMarks: number;
  attemptCount: number;
  createdAt: string;
}

export interface PublicQuestion {
  _id: string;
  text: string;
  type: QuestionType;
  marks: number;
  negativeMarks: number;
  options: { _id: string; text: string }[];
}

export interface IPublicQuiz {
  _id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  category: CategoryRef;
  seriesName: string;
  durationMinutes: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  passPercentage: number;
  questionCount: number;
  totalMarks: number;
  seoTitle: string;
  seoDescription: string;
  questions: PublicQuestion[];
}

export interface QuizInput extends PublishInput {
  title: string;
  slug?: string;
  description: string;
  instructions: string;
  category: string;
  seriesName: string;
  durationMinutes: number;
  defaultMarks: number;
  defaultNegativeMarks: number;
  passPercentage: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showAnswers: boolean;
  seoTitle: string;
  seoDescription: string;
  questions: QuizQuestionInput[];
}

export interface SubmitQuizRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  answers: { questionId: string; selected: string[] }[];
  timeTakenSec: number;
}

export interface ReviewItem {
  questionId: string;
  text: string;
  type: QuestionType;
  marks: number;
  negativeMarks: number;
  explanation: string;
  status: 'correct' | 'wrong' | 'unattempted';
  awarded: number;
  selected: string[];
  options: { _id: string; text: string; isCorrect: boolean }[];
}

export interface QuizResult {
  attemptId: string;
  leadId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  unattempted: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  passPercentage: number;
  timeTakenSec: number;
  showAnswers: boolean;
  review: ReviewItem[];
}

export interface IQuizAttempt {
  _id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  unattempted: number;
  percentage: number;
  passed: boolean;
  timeTakenSec: number;
  lead?: string;
  createdAt: string;
}

export interface QuizQuery {
  category?: string;
  search?: string;
  status?: 'draft' | 'published' | 'scheduled';
  page?: number;
  limit?: number;
}

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Quiz'] });

export const quizApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQuizzes: builder.query<ListResponse<IQuizSummary>, QuizQuery | void>({
      query: (params) => ({ url: '/quizzes', params: params || {} }),
      providesTags: [{ type: 'Quiz', id: 'PUBLIC' }],
    }),
    getQuizBySlug: builder.query<ItemResponse<IPublicQuiz>, string>({
      query: (slug) => ({ url: `/quizzes/slug/${slug}` }),
      providesTags: (_r, _e, slug) => [{ type: 'Quiz', id: `slug:${slug}` }],
    }),
    submitQuiz: builder.mutation<ItemResponse<QuizResult>, SubmitQuizRequest>({
      query: ({ id, ...body }) => ({ url: `/quizzes/${id}/submit`, method: 'POST', body }),
      // A submission creates a lead.
      invalidatesTags: [{ type: 'lead' as never, id: 'LIST' }, { type: 'lead' as never, id: 'STATS' }],
    }),

    getAdminQuizzes: builder.query<ListResponse<IQuizSummary>, QuizQuery | void>({
      query: (params) => ({ url: '/quizzes/admin', params: params || {} }),
      providesTags: [{ type: 'Quiz', id: 'LIST' }],
    }),
    getAdminQuiz: builder.query<ItemResponse<IQuizAdmin>, string>({
      query: (id) => ({ url: `/quizzes/admin/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Quiz', id }],
    }),
    getQuizAttempts: builder.query<
      { success: boolean; data: IQuizAttempt[]; pagination: Pagination },
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, ...params }) => ({ url: `/quizzes/admin/${id}/attempts`, params }),
      providesTags: (_r, _e, { id }) => [{ type: 'Quiz', id: `attempts:${id}` }],
    }),
    createQuiz: builder.mutation<ItemResponse<IQuizAdmin>, QuizInput>({
      query: (body) => ({ url: '/quizzes', method: 'POST', body }),
      invalidatesTags: [{ type: 'Quiz', id: 'LIST' }, { type: 'Quiz', id: 'PUBLIC' }],
    }),
    updateQuiz: builder.mutation<ItemResponse<IQuizAdmin>, { id: string; body: Partial<QuizInput> }>({
      query: ({ id, body }) => ({ url: `/quizzes/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Quiz', id },
        { type: 'Quiz', id: 'LIST' },
        { type: 'Quiz', id: 'PUBLIC' },
      ],
    }),
    updateQuizStatus: builder.mutation<ItemResponse<IQuizAdmin>, { id: string } & PublishInput>({
      query: ({ id, ...body }) => ({ url: `/quizzes/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Quiz', id },
        { type: 'Quiz', id: 'LIST' },
        { type: 'Quiz', id: 'PUBLIC' },
      ],
    }),
    deleteQuiz: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/quizzes/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Quiz', id: 'LIST' }, { type: 'Quiz', id: 'PUBLIC' }],
    }),
    bulkDeleteQuizzes: builder.mutation<{ success: boolean }, string[]>({
      query: (ids) => ({ url: '/quizzes/bulk-delete', method: 'POST', body: { ids } }),
      invalidatesTags: [{ type: 'Quiz', id: 'LIST' }, { type: 'Quiz', id: 'PUBLIC' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuizzesQuery,
  useGetQuizBySlugQuery,
  useSubmitQuizMutation,
  useGetAdminQuizzesQuery,
  useGetAdminQuizQuery,
  useGetQuizAttemptsQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useUpdateQuizStatusMutation,
  useDeleteQuizMutation,
  useBulkDeleteQuizzesMutation,
} = quizApi;
