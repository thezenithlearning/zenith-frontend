'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CircleCheck,
  CircleX,
  Clock,
  ListChecks,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Trophy,
} from 'lucide-react';
import { LeadForm, type LeadValues } from '@/components/public/LeadCaptureModal';
import { EmptyState } from '@/components/public/PublicParts';
import {
  useGetQuizBySlugQuery,
  useSubmitQuizMutation,
  type IPublicQuiz,
  type PublicQuestion,
  type QuizResult,
} from '@/features/quiz/api/quizApi';
import { errorMessage } from '@/features/content/types';

type Phase = 'intro' | 'running' | 'lead' | 'result';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const clock = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

export default function QuizPlayer({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useGetQuizBySlugQuery(slug);
  const quiz = data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2147a8]" />
      </div>
    );
  }
  if (isError || !quiz) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState title="Mock test not found" text="This test may have been removed or is not published yet." />
        <div className="mt-6 text-center">
          <Link href="/mock-tests" className="font-semibold text-[#2147a8] hover:underline">
            Browse all mock tests
          </Link>
        </div>
      </div>
    );
  }
  return <Player key={quiz._id} quiz={quiz} />;
}

function Player({ quiz }: { quiz: IPublicQuiz }) {
  const [submitQuiz] = useSubmitQuizMutation();

  const [phase, setPhase] = useState<Phase>('intro');
  const [order, setOrder] = useState<PublicQuestion[]>(quiz.questions);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [timeUp, setTimeUp] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const limit = quiz.durationMinutes * 60; // 0 = untimed
  const remaining = limit ? limit - elapsed : 0;

  // ── timer: timestamp-based so background-tab throttling can't skew it ──────
  const accumulated = useRef(0);
  const lastTick = useRef(0);
  useEffect(() => {
    if (phase !== 'running' || paused) return;
    lastTick.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      accumulated.current += now - lastTick.current;
      lastTick.current = now;
      setElapsed(Math.floor(accumulated.current / 1000));
    }, 500);
    return () => {
      // bank the partial interval before pausing/stopping
      accumulated.current += Date.now() - lastTick.current;
      clearInterval(id);
    };
  }, [phase, paused]);

  const finish = useCallback((byTimeout: boolean) => {
    setPaused(false);
    setTimeUp(byTimeout);
    setPhase('lead');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (phase === 'running' && limit && elapsed >= limit) finish(true);
  }, [phase, limit, elapsed, finish]);

  // warn before leaving mid-test
  useEffect(() => {
    if (phase !== 'running' && phase !== 'lead') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  const start = () => {
    let qs = quiz.shuffleQuestions ? shuffle(quiz.questions) : quiz.questions;
    if (quiz.shuffleOptions) qs = qs.map((q) => ({ ...q, options: shuffle(q.options) }));
    setOrder(qs);
    setAnswers({});
    setMarked({});
    setCurrent(0);
    accumulated.current = 0;
    setElapsed(0);
    setTimeUp(false);
    setPaused(false);
    setResult(null);
    setPhase('running');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = order.filter((q) => (answers[q._id] ?? []).length > 0).length;

  const select = (q: PublicQuestion, optionId: string) => {
    setAnswers((prev) => {
      const now = prev[q._id] ?? [];
      if (q.type === 'single') return { ...prev, [q._id]: [optionId] };
      return {
        ...prev,
        [q._id]: now.includes(optionId) ? now.filter((id) => id !== optionId) : [...now, optionId],
      };
    });
  };

  const requestSubmit = () => {
    const left = order.length - answeredCount;
    const msg = left
      ? `You have ${left} unanswered question${left === 1 ? '' : 's'}. Submit the test now?`
      : 'Submit your test now?';
    if (confirm(msg)) finish(false);
  };

  const submitWithLead = async (lead: LeadValues) => {
    try {
      const res = await submitQuiz({
        id: quiz._id,
        ...lead,
        timeTakenSec: Math.min(elapsed, limit || elapsed),
        answers: order.map((q) => ({ questionId: q._id, selected: answers[q._id] ?? [] })),
      }).unwrap();
      setResult(res.data);
      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      throw new Error(errorMessage(err, 'Could not submit your test. Please try again.'));
    }
  };

  // ───────────────────────────── INTRO ─────────────────────────────
  if (phase === 'intro') {
    return (
      <main className="bg-slate-50 px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/mock-tests" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#2147a8]">
            <ArrowLeft className="h-4 w-4" /> All mock tests
          </Link>
          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5">
            <div className="bg-[#0a1a40] px-6 py-8 text-white sm:px-10">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#f2c75c]">{quiz.category?.name}</span>
              {quiz.seriesName && <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#f2c75c]">{quiz.seriesName}</p>}
              <h1 className="mt-1 text-2xl font-black leading-tight sm:text-4xl">{quiz.title}</h1>
              {quiz.description && <p className="mt-3 text-sm text-blue-50/75 sm:text-base">{quiz.description}</p>}
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 text-center">
              {[
                [ListChecks, `${quiz.questionCount}`, 'Questions'],
                [Trophy, `${quiz.totalMarks}`, 'Total marks'],
                [Clock, quiz.durationMinutes ? `${quiz.durationMinutes} min` : 'No limit', 'Duration'],
              ].map(([Icon, value, label]) => {
                const I = Icon as typeof Clock;
                return (
                  <div key={label as string} className="px-2 py-5">
                    <I className="mx-auto h-5 w-5 text-[#2147a8]" />
                    <p className="mt-1.5 text-lg font-black text-slate-900">{value as string}</p>
                    <p className="text-xs text-slate-500">{label as string}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-5 px-6 py-7 sm:px-10">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">Instructions</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
                  {quiz.instructions
                    ? quiz.instructions.split('\n').filter(Boolean).map((l, i) => <li key={i}>{l}</li>)
                    : null}
                  {quiz.durationMinutes > 0 && <li>The timer starts when you press Start and the test auto-submits when time is over.</li>}
                  <li>You can pause the timer at any time; questions stay hidden while paused.</li>
                  <li>Some questions may carry negative marking for wrong answers — marks are shown on every question.</li>
                  <li>After submitting you will enter your details to see your complete result.</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={start}
                disabled={quiz.questions.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2147a8] px-6 py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#1b3b8c] hover:shadow-xl disabled:opacity-50 sm:w-auto"
              >
                <Play className="h-5 w-5" /> Start test
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ───────────────────────────── LEAD GATE ─────────────────────────────
  if (phase === 'lead') {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2147a8]">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-black text-slate-900">
            {timeUp ? "Time's up!" : 'Test completed'}
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            You answered {answeredCount} of {order.length} questions. Enter your details to unlock your score and answer analysis.
          </p>
          <div className="mt-6">
            <LeadForm cta="View my result" onSubmit={submitWithLead} />
          </div>
          {!timeUp && (
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                setPhase('running');
              }}
              className="mt-4 w-full text-center text-sm font-semibold text-slate-500 hover:text-[#2147a8]"
            >
              ← Back to the test
            </button>
          )}
        </div>
      </main>
    );
  }

  // ───────────────────────────── RESULT ─────────────────────────────
  if (phase === 'result' && result) {
    return <ResultView quiz={quiz} result={result} onRetake={start} />;
  }

  // ───────────────────────────── RUNNING ─────────────────────────────
  const q = order[current];
  const chosen = answers[q._id] ?? [];
  const lowTime = limit > 0 && remaining <= 60;

  return (
    <main className="bg-slate-50">
      {/* sticky test bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">{quiz.title}</p>
            <p className="text-xs text-slate-500">
              {answeredCount}/{order.length} answered
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              role="timer"
              aria-live="off"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-bold tabular-nums ${
                paused ? 'bg-amber-50 text-amber-700' : lowTime ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#2147a8]'
              }`}
            >
              <Timer className="h-4 w-4" />
              {limit ? clock(remaining) : clock(elapsed)}
              {paused && <span className="hidden text-xs font-semibold sm:inline">Paused</span>}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#2147a8] hover:text-[#2147a8]"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span className="hidden sm:inline">{paused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              type="button"
              onClick={requestSubmit}
              className="rounded-xl bg-[#2147a8] px-4 py-2 text-sm font-bold text-white hover:bg-[#1b3b8c]"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* floating timer stays visible while scrolling (the public navbar is sticky) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-xl backdrop-blur">
          <Timer className={`h-4 w-4 ${paused ? 'text-amber-600' : lowTime ? 'text-red-600' : 'text-[#2147a8]'}`} />
          <span className={`font-mono text-sm font-bold tabular-nums ${lowTime && !paused ? 'text-red-600' : 'text-slate-800'}`}>
            {limit ? clock(remaining) : clock(elapsed)}
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume timer' : 'Pause timer'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#2147a8]"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 pb-24 lg:grid-cols-[1fr_300px]">
        <section className="relative min-w-0">
          {paused ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
              <Pause className="h-10 w-10 text-amber-600" />
              <p className="mt-3 text-xl font-black text-slate-900">Test paused</p>
              <p className="mt-1 text-sm text-slate-600">The timer is stopped. Questions are hidden until you resume.</p>
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2147a8] px-6 py-3 font-bold text-white hover:bg-[#1b3b8c]"
              >
                <Play className="h-4 w-4" /> Resume test
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Question {current + 1} of {order.length}
                </span>
                <span className="flex gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">+{q.marks}</span>
                  {q.negativeMarks > 0 && <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">−{q.negativeMarks}</span>}
                </span>
              </div>

              <h2 className="mt-5 whitespace-pre-line text-lg font-bold leading-relaxed text-slate-900 sm:text-xl">{q.text}</h2>
              {q.type === 'multiple' && (
                <p className="mt-2 text-xs font-semibold text-[#2147a8]">Select all correct options</p>
              )}

              <div className="mt-5 space-y-3" role={q.type === 'single' ? 'radiogroup' : 'group'} aria-label="Answer options">
                {q.options.map((o, i) => {
                  const active = chosen.includes(o._id);
                  return (
                    <label
                      key={o._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all ${
                        active ? 'border-[#2147a8] bg-blue-50' : 'border-slate-200 hover:border-[#2147a8]/40 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type={q.type === 'single' ? 'radio' : 'checkbox'}
                        name={`q-${q._id}`}
                        checked={active}
                        onChange={() => select(q, o._id)}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-black ${
                          q.type === 'single' ? 'rounded-full' : 'rounded-lg'
                        } ${active ? 'bg-[#2147a8] text-white' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium leading-relaxed text-slate-800 sm:text-base">{o.text}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMarked((m) => ({ ...m, [q._id]: !m[q._id] }))}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold ${
                      marked[q._id] ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" /> {marked[q._id] ? 'Marked' : 'Mark for review'}
                  </button>
                  <button
                    type="button"
                    disabled={chosen.length === 0}
                    onClick={() => setAnswers((a) => ({ ...a, [q._id]: [] }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={current === 0}
                    onClick={() => setCurrent((c) => c - 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Prev
                  </button>
                  {current < order.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrent((c) => c + 1)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#2147a8] px-5 py-2 text-sm font-bold text-white hover:bg-[#1b3b8c]"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={requestSubmit}
                      className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      Finish test
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* palette */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900">Question palette</h3>
            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {order.map((item, i) => {
                const done = (answers[item._id] ?? []).length > 0;
                const isCurrent = i === current;
                return (
                  <button
                    key={item._id}
                    type="button"
                    disabled={paused}
                    aria-label={`Go to question ${i + 1}`}
                    onClick={() => setCurrent(i)}
                    className={`relative aspect-square rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                      isCurrent
                        ? 'ring-2 ring-slate-900 ring-offset-2'
                        : ''
                    } ${done ? 'bg-[#2147a8] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {i + 1}
                    {marked[item._id] && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-[#2147a8]" />Answered</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-slate-200" />Not answered</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />Marked</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ResultView({ quiz, result, onRetake }: { quiz: IPublicQuiz; result: QuizResult; onRetake: () => void }) {
  const pct = Math.max(0, Math.min(100, result.percentage));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const stats = useMemo(
    () => [
      { label: 'Correct', value: result.correct, tone: 'text-blue-700 bg-blue-50' },
      { label: 'Wrong', value: result.wrong, tone: 'text-red-600 bg-red-50' },
      { label: 'Unattempted', value: result.unattempted, tone: 'text-slate-600 bg-slate-100' },
      {
        label: 'Time taken',
        value: `${Math.floor(result.timeTakenSec / 60)}m ${result.timeTakenSec % 60}s`,
        tone: 'text-sky-700 bg-sky-50',
      },
    ],
    [result],
  );

  return (
    <main className="bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5">
          <div className="bg-[#0a1a40] px-6 py-6 text-center text-white sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f2c75c]">Your result</p>
            <h1 className="mt-2 text-xl font-black sm:text-2xl">{quiz.title}</h1>
          </div>

          <div className="flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:justify-center sm:gap-10">
            <div className="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke={result.passed ? '#2147a8' : '#ef4444'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{result.percentage}%</span>
                <span className="text-xs text-slate-500">accuracy score</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-500">Your score</p>
              <p className="text-5xl font-black text-slate-900">
                {result.score}
                <span className="text-2xl font-bold text-slate-400"> / {result.totalMarks}</span>
              </p>
              <span
                className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${
                  result.passed ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'
                }`}
              >
                {result.passed ? 'Great job — you passed!' : 'Keep practising — you can do better'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-5 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 text-center ${s.tone}`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs font-semibold opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row">
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2147a8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1b3b8c]"
            >
              <RotateCcw className="h-4 w-4" /> Retake test
            </button>
            <Link
              href="/mock-tests"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              More mock tests
            </Link>
          </div>
        </div>

        {result.showAnswers && result.review.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-black text-slate-900">Answer review</h2>
            <div className="space-y-4">
              {result.review.map((item, i) => (
                <article key={item.questionId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-line font-bold text-slate-900">
                      <span className="mr-2 text-slate-400">Q{i + 1}.</span>
                      {item.text}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.status === 'correct'
                          ? 'bg-blue-50 text-blue-700'
                          : item.status === 'wrong'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.status === 'correct' ? <CircleCheck className="h-3.5 w-3.5" /> : item.status === 'wrong' ? <CircleX className="h-3.5 w-3.5" /> : null}
                      {item.awarded > 0 ? `+${item.awarded}` : item.awarded}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {item.options.map((o) => {
                      const picked = item.selected.includes(o._id);
                      const cls = o.isCorrect
                        ? 'border-blue-400 bg-blue-50'
                        : picked
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-200';
                      return (
                        <li key={o._id} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${cls}`}>
                          <span className="text-slate-800">{o.text}</span>
                          <span className="shrink-0 text-xs font-bold">
                            {o.isCorrect ? <span className="text-blue-700">Correct{picked ? ' · Your answer' : ''}</span> : picked ? <span className="text-red-600">Your answer</span> : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {item.explanation && (
                    <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <strong className="text-slate-800">Explanation: </strong>
                      {item.explanation}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
