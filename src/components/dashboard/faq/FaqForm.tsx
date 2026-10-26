'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import RichTextEditor from '@/components/dashboard/RichTextEditor';
import PublishPanel, { type PublishState } from '@/components/dashboard/content/PublishPanel';
import CategorySelect from '@/components/dashboard/content/CategorySelect';
import { faqBasePath } from '@/components/dashboard/faq/faqPaths';
import { inputClass } from '@/components/dashboard/content/ListParts';
import {
  useCreateFaqMutation,
  useUpdateFaqMutation,
  type FaqScope,
  type IFaq,
} from '@/features/faq/api/faqApi';
import {
  errorMessage,
  fromLocalInput,
  stripHtml,
  toLocalInput,
} from '@/features/content/types';

export default function FaqForm({ faq, scope: scopeProp = 'qna' }: { faq?: IFaq; scope?: FaqScope }) {
  const router = useRouter();
  const [createFaq, { isLoading: creating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: updating }] = useUpdateFaqMutation();

  const [question, setQuestion] = useState(faq?.question ?? '');
  const [answer, setAnswer] = useState(faq?.answer ?? '');
  const scope: FaqScope = faq?.scope ?? scopeProp;
  const base = faqBasePath(scope);
  const label = scope === 'qna' ? 'QnA' : 'FAQ';
  const [category, setCategory] = useState(faq?.category?._id ?? '');
  const [sortOrder, setSortOrder] = useState(String(faq?.sortOrder ?? 0));
  const [publish, setPublish] = useState<PublishState>({
    status: faq?.status ?? 'published',
    publishAt: toLocalInput(faq?.publishAt),
  });
  const [error, setError] = useState('');

  const busy = creating || updating;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (question.trim().length < 3) return setError('Enter the question (at least 3 characters).');
    if (!stripHtml(answer)) return setError('Write an answer for this question.');
    if (scope === 'qna' && !category) return setError('Choose the course category this Q&A belongs to.');

    const publishAt = fromLocalInput(publish.publishAt);
    if (publish.status === 'scheduled' && !publishAt) {
      return setError('Pick a date and time for scheduled publishing.');
    }

    const body = {
      question: question.trim(),
      answer,
      scope,
      ...(category ? { category } : {}),
      sortOrder: Number(sortOrder) || 0,
      status: publish.status,
      ...(publish.status === 'scheduled' ? { publishAt } : {}),
    };

    try {
      if (faq) await updateFaq({ id: faq._id, body }).unwrap();
      else await createFaq(body).unwrap();
      router.push(base);
    } catch (err) {
      setError(errorMessage(err, 'Could not save the FAQ'));
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={base}
            aria-label={`Back to ${label}`}
            className="rounded-xl bg-white p-2 text-gray-600 shadow-sm transition-all hover:text-indigo-600 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{faq ? `Edit ${label}` : `New ${label}`}</h1>
            <p className="text-sm text-gray-500">
              {scope === 'general'
                ? 'Shown on the public FAQs page.'
                : 'Shown on the public QnA page under the selected course category.'}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {publish.status === 'draft'
            ? 'Save draft'
            : publish.status === 'scheduled'
              ? 'Schedule FAQ'
              : faq
                ? 'Save & publish'
                : 'Publish FAQ'}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <label htmlFor="faq-question" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Question
            </label>
            <input
              id="faq-question"
              value={question}
              maxLength={500}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does the diagnostic assessment work?"
              className={inputClass}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Answer</span>
            <RichTextEditor value={answer} onChange={setAnswer} placeholder="Write the answer…" />
          </div>
        </div>

        <aside className="space-y-5">
          <PublishPanel value={publish} onChange={setPublish} />

          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <label htmlFor="faq-category" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Course category{scope === 'general' ? ' (optional label)' : ''}
              </label>
              <CategorySelect id="faq-category" value={category} onChange={setCategory} />
            </div>
            <div>
              <label htmlFor="faq-order" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Display order
              </label>
              <input
                id="faq-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">Lower numbers appear first.</p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
