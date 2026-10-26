'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import PublishPanel, { type PublishState } from '@/components/dashboard/content/PublishPanel';
import CategorySelect from '@/components/dashboard/content/CategorySelect';
import { inputClass } from '@/components/dashboard/content/ListParts';
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  type IQuizAdmin,
  type QuestionType,
  type QuizInput,
} from '@/features/quiz/api/quizApi';
import { errorMessage, fromLocalInput, toLocalInput } from '@/features/content/types';

interface OptionDraft {
  key: string;
  _id?: string;
  text: string;
  isCorrect: boolean;
}
interface QuestionDraft {
  key: string;
  _id?: string;
  text: string;
  type: QuestionType;
  options: OptionDraft[];
  marks: string;
  negativeMarks: string;
  explanation: string;
}

let counter = 0;
const uid = () => `k${Date.now().toString(36)}${counter++}`;

const blankOption = (): OptionDraft => ({ key: uid(), text: '', isCorrect: false });
const blankQuestion = (marks: string, neg: string): QuestionDraft => ({
  key: uid(),
  text: '',
  type: 'single',
  options: [blankOption(), blankOption(), blankOption(), blankOption()],
  marks,
  negativeMarks: neg,
  explanation: '',
});

const fromServer = (q: IQuizAdmin['questions'][number]): QuestionDraft => ({
  key: uid(),
  _id: q._id,
  text: q.text,
  type: q.type,
  marks: String(q.marks),
  negativeMarks: String(q.negativeMarks),
  explanation: q.explanation ?? '',
  options: q.options.map((o) => ({ key: uid(), _id: o._id, text: o.text, isCorrect: o.isCorrect })),
});

export default function QuizForm({ quiz }: { quiz?: IQuizAdmin }) {
  const router = useRouter();
  const [createQuiz, { isLoading: creating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: updating }] = useUpdateQuizMutation();
  const questionsEnd = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(quiz?.title ?? '');
  const [slug, setSlug] = useState(quiz?.slug ?? '');
  const [description, setDescription] = useState(quiz?.description ?? '');
  const [instructions, setInstructions] = useState(quiz?.instructions ?? '');
  const [category, setCategory] = useState(quiz?.category?._id ?? '');
  const [seriesName, setSeriesName] = useState(quiz?.seriesName ?? '');
  const [duration, setDuration] = useState(String(quiz?.durationMinutes ?? 30));
  const [defaultMarks, setDefaultMarks] = useState(String(quiz?.defaultMarks ?? 1));
  const [defaultNeg, setDefaultNeg] = useState(String(quiz?.defaultNegativeMarks ?? 0));
  const [passPct, setPassPct] = useState(String(quiz?.passPercentage ?? 40));
  const [shuffleQuestions, setShuffleQuestions] = useState(quiz?.shuffleQuestions ?? false);
  const [shuffleOptions, setShuffleOptions] = useState(quiz?.shuffleOptions ?? false);
  const [showAnswers, setShowAnswers] = useState(quiz?.showAnswers ?? true);
  const [seoTitle, setSeoTitle] = useState(quiz?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(quiz?.seoDescription ?? '');
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    quiz?.questions?.length ? quiz.questions.map(fromServer) : [blankQuestion('1', '0')],
  );
  const [publish, setPublish] = useState<PublishState>({
    status: quiz?.status ?? 'published',
    publishAt: toLocalInput(quiz?.publishAt),
  });
  const [error, setError] = useState('');
  const busy = creating || updating;

  const totalMarks = useMemo(
    () => questions.reduce((s, q) => s + (Number(q.marks) || 0), 0),
    [questions],
  );

  const patchQuestion = (key: string, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));

  const patchOption = (qKey: string, oKey: string, patch: Partial<OptionDraft>) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.key !== qKey ? q : { ...q, options: q.options.map((o) => (o.key === oKey ? { ...o, ...patch } : o)) },
      ),
    );

  const toggleCorrect = (q: QuestionDraft, oKey: string) => {
    setQuestions((qs) =>
      qs.map((x) =>
        x.key !== q.key
          ? x
          : {
              ...x,
              options: x.options.map((o) =>
                o.key === oKey
                  ? { ...o, isCorrect: x.type === 'single' ? true : !o.isCorrect }
                  : x.type === 'single'
                    ? { ...o, isCorrect: false }
                    : o,
              ),
            },
      ),
    );
  };

  const changeType = (q: QuestionDraft, type: QuestionType) => {
    if (type === q.type) return;
    // single-answer questions can only keep one correct option
    let seen = false;
    const options =
      type === 'single'
        ? q.options.map((o) => {
            if (o.isCorrect && !seen) {
              seen = true;
              return o;
            }
            return { ...o, isCorrect: false };
          })
        : q.options;
    patchQuestion(q.key, { type, options });
  };

  const move = (index: number, dir: -1 | 1) =>
    setQuestions((qs) => {
      const next = [...qs];
      const target = index + dir;
      if (target < 0 || target >= next.length) return qs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const duplicate = (index: number) =>
    setQuestions((qs) => {
      const src = qs[index];
      const copy: QuestionDraft = {
        ...src,
        key: uid(),
        _id: undefined,
        options: src.options.map((o) => ({ ...o, key: uid(), _id: undefined })),
      };
      return [...qs.slice(0, index + 1), copy, ...qs.slice(index + 1)];
    });

  const applyDefaults = () => {
    if (!confirm('Apply the default marks and negative marks to every question?')) return;
    setQuestions((qs) => qs.map((q) => ({ ...q, marks: defaultMarks, negativeMarks: defaultNeg })));
  };

  const addQuestion = () => {
    setQuestions((qs) => [...qs, blankQuestion(defaultMarks, defaultNeg)]);
    setTimeout(() => questionsEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const validate = (): string => {
    if (title.trim().length < 3) return 'Enter a title for the mock test.';
    if (!category) return 'Choose the course category for this mock test.';
    if (publish.status !== 'draft' && questions.length === 0) return 'Add at least one question.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const n = i + 1;
      if (!q.text.trim()) return `Question ${n}: enter the question text.`;
      if (q.options.length < 2) return `Question ${n}: add at least 2 options.`;
      if (q.options.some((o) => !o.text.trim())) return `Question ${n}: fill in or remove empty options.`;
      if (!q.options.some((o) => o.isCorrect)) return `Question ${n}: mark the correct option.`;
      if (Number(q.marks) < 0 || Number.isNaN(Number(q.marks))) return `Question ${n}: marks must be 0 or more.`;
      if (Number(q.negativeMarks) < 0 || Number.isNaN(Number(q.negativeMarks)))
        return `Question ${n}: negative marks must be 0 or more.`;
    }
    if (publish.status === 'scheduled' && !fromLocalInput(publish.publishAt)) {
      return 'Pick a date and time for scheduled publishing.';
    }
    return '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;

    const body: QuizInput = {
      title: title.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      description: description.trim(),
      instructions: instructions.trim(),
      category,
      seriesName: seriesName.trim(),
      durationMinutes: Number(duration) || 0,
      defaultMarks: Number(defaultMarks) || 0,
      defaultNegativeMarks: Number(defaultNeg) || 0,
      passPercentage: Number(passPct) || 0,
      shuffleQuestions,
      shuffleOptions,
      showAnswers,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      status: publish.status,
      ...(publish.status === 'scheduled' ? { publishAt: fromLocalInput(publish.publishAt) } : {}),
      questions: questions.map((q) => ({
        ...(q._id ? { _id: q._id } : {}),
        text: q.text.trim(),
        type: q.type,
        marks: Number(q.marks) || 0,
        negativeMarks: Number(q.negativeMarks) || 0,
        explanation: q.explanation.trim(),
        options: q.options.map((o) => ({
          ...(o._id ? { _id: o._id } : {}),
          text: o.text.trim(),
          isCorrect: o.isCorrect,
        })),
      })),
    };

    try {
      if (quiz) await updateQuiz({ id: quiz._id, body }).unwrap();
      else await createQuiz(body).unwrap();
      router.push('/dashboard/quizzes');
    } catch (err) {
      setError(errorMessage(err, 'Could not save the mock test'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/quizzes"
            aria-label="Back to mock tests"
            className="rounded-xl bg-white p-2 text-gray-600 shadow-sm transition-all hover:text-indigo-600 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz ? 'Edit mock test' : 'New mock test'}</h1>
            <p className="text-sm text-gray-500">
              {questions.length} question{questions.length === 1 ? '' : 's'} · {totalMarks} total marks
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {publish.status === 'draft' ? 'Save draft' : publish.status === 'scheduled' ? 'Schedule test' : quiz ? 'Save & publish' : 'Publish test'}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Details */}
          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <label htmlFor="quiz-title" className="mb-1.5 block text-sm font-semibold text-gray-700">Test title</label>
              <input id="quiz-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SAT Math – Mock Test 1" className={inputClass} />
            </div>
            <div>
              <label htmlFor="quiz-desc" className="mb-1.5 block text-sm font-semibold text-gray-700">Description</label>
              <textarea id="quiz-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="quiz-instr" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Instructions <span className="font-normal text-gray-400">(shown before the test starts)</span>
              </label>
              <textarea id="quiz-instr" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="quiz-series" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Test series <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input id="quiz-series" value={seriesName} onChange={(e) => setSeriesName(e.target.value)} placeholder="e.g. SAT 2027 Series" className={inputClass} />
              </div>
              <div>
                <label htmlFor="quiz-duration" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Duration (minutes) <span className="font-normal text-gray-400">0 = untimed</span>
                </label>
                <input id="quiz-duration" type="number" min={0} max={600} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Scoring &amp; behaviour</h2>
                <p className="text-xs text-gray-500">Defaults apply to new questions; each question can override them.</p>
              </div>
              <button type="button" onClick={applyDefaults} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Apply to all questions
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="quiz-marks" className="mb-1.5 block text-sm font-semibold text-gray-700">Marks / question</label>
                <input id="quiz-marks" type="number" min={0} step="0.25" value={defaultMarks} onChange={(e) => setDefaultMarks(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="quiz-neg" className="mb-1.5 block text-sm font-semibold text-gray-700">Negative marks</label>
                <input id="quiz-neg" type="number" min={0} step="0.25" value={defaultNeg} onChange={(e) => setDefaultNeg(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="quiz-pass" className="mb-1.5 block text-sm font-semibold text-gray-700">Pass mark (%)</label>
                <input id="quiz-pass" type="number" min={0} max={100} value={passPct} onChange={(e) => setPassPct(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Shuffle questions', shuffleQuestions, setShuffleQuestions],
                ['Shuffle options', shuffleOptions, setShuffleOptions],
                ['Show answers in result', showAnswers, setShowAnswers],
              ].map(([label, value, set]) => (
                <label key={label as string} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => (set as (v: boolean) => void)(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {label as string}
                </label>
              ))}
            </div>
          </section>

          {/* Questions */}
          <section className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">Q{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label="Move down" disabled={index === questions.length - 1} onClick={() => move(index, 1)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" aria-label="Duplicate question" onClick={() => duplicate(index)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><Copy className="h-4 w-4" /></button>
                    <button
                      type="button"
                      aria-label="Delete question"
                      onClick={() => setQuestions((qs) => qs.filter((x) => x.key !== q.key))}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  aria-label={`Question ${index + 1} text`}
                  rows={2}
                  value={q.text}
                  onChange={(e) => patchQuestion(q.key, { text: e.target.value })}
                  placeholder="Type the question…"
                  className={inputClass}
                />

                <div className="mt-3 inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                  {(['single', 'multiple'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => changeType(q, t)}
                      className={`rounded-lg px-3 py-1.5 transition-colors ${q.type === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                    >
                      {t === 'single' ? 'Single correct' : 'Multiple correct'}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500">
                    Tick the {q.type === 'single' ? 'correct option' : 'correct options'}.
                  </p>
                  {q.options.map((o, oi) => (
                    <div key={o.key} className="flex items-center gap-2">
                      <input
                        type={q.type === 'single' ? 'radio' : 'checkbox'}
                        name={`correct-${q.key}`}
                        aria-label={`Mark option ${oi + 1} correct`}
                        checked={o.isCorrect}
                        onChange={() => toggleCorrect(q, o.key)}
                        className="h-4 w-4 shrink-0 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        aria-label={`Option ${oi + 1}`}
                        value={o.text}
                        onChange={(e) => patchOption(q.key, o.key, { text: e.target.value })}
                        placeholder={`Option ${oi + 1}`}
                        className={`${inputClass} ${o.isCorrect ? '!border-blue-400 !bg-blue-50/60' : ''}`}
                      />
                      <button
                        type="button"
                        aria-label="Remove option"
                        disabled={q.options.length <= 2}
                        onClick={() => patchQuestion(q.key, { options: q.options.filter((x) => x.key !== o.key) })}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 disabled:opacity-30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {q.options.length < 8 && (
                    <button
                      type="button"
                      onClick={() => patchQuestion(q.key, { options: [...q.options, blankOption()] })}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      + Add option
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Marks for correct answer</label>
                    <input type="number" min={0} step="0.25" value={q.marks} onChange={(e) => patchQuestion(q.key, { marks: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Negative marks for wrong answer</label>
                    <input type="number" min={0} step="0.25" value={q.negativeMarks} onChange={(e) => patchQuestion(q.key, { negativeMarks: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Explanation <span className="font-normal text-gray-400">(shown in result review)</span>
                  </label>
                  <textarea rows={2} value={q.explanation} onChange={(e) => patchQuestion(q.key, { explanation: e.target.value })} className={inputClass} />
                </div>
              </div>
            ))}

            <div ref={questionsEnd} />
            <button
              type="button"
              onClick={addQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-gray-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add question
            </button>
          </section>

          {/* SEO */}
          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold text-gray-900">SEO</h2>
            <div>
              <label htmlFor="quiz-seo-title" className="mb-1.5 block text-sm font-semibold text-gray-700">SEO title</label>
              <input id="quiz-seo-title" value={seoTitle} maxLength={200} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="quiz-seo-desc" className="mb-1.5 block text-sm font-semibold text-gray-700">SEO description</label>
              <textarea id="quiz-seo-desc" rows={3} maxLength={400} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="quiz-slug" className="mb-1.5 block text-sm font-semibold text-gray-700">
                URL slug <span className="font-normal text-gray-400">(auto-generated if blank)</span>
              </label>
              <input id="quiz-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} className={inputClass} />
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <PublishPanel value={publish} onChange={setPublish} />
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <label htmlFor="quiz-category" className="mb-1.5 block text-sm font-semibold text-gray-700">Course category</label>
            <CategorySelect id="quiz-category" value={category} onChange={setCategory} />
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 p-5 text-white shadow-lg shadow-indigo-500/20">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Summary</p>
            <p className="mt-2 text-3xl font-black">{totalMarks}</p>
            <p className="text-sm opacity-90">total marks · {questions.length} questions</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
