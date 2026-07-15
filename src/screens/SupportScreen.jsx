import { useState, useEffect, useContext } from 'react';
import { HelpCircle, MessageSquare, Plus, Check, X, ShieldAlert, Send, Clock, UserCheck } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { getQuestions, askQuestion, answerQuestion } from '../api/client.js';

export default function SupportScreen({ t, onNavigate, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Submit state
  const [newQuestion, setNewQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [askModal, setAskModal] = useState(false);

  // Answer state
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [adminAnswer, setAdminAnswer] = useState('');
  const [answering, setAnswering] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getQuestions();
      if (res && res.success) {
        setQuestions(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load support board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setAsking(true);
    try {
      const res = await askQuestion({ question: newQuestion });
      if (res && res.success) {
        setNewQuestion('');
        setAskModal(false);
        fetchQuestions();
      }
    } catch (err) {
      alert(err.message || 'Could not submit question');
    } finally {
      setAsking(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion || !adminAnswer.trim()) return;
    setAnswering(true);
    try {
      const res = await answerQuestion(selectedQuestion._id, { answer: adminAnswer });
      if (res && res.success) {
        setSelectedQuestion(null);
        setAdminAnswer('');
        fetchQuestions();
      }
    } catch (err) {
      alert(err.message || 'Could not submit answer');
    } finally {
      setAnswering(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar
        t={t}
        title="Support & Q&A Board"
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
      />

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        <div className="max-w-4xl mx-auto w-full px-4 flex flex-col gap-6">

          {/* Banner greeting card */}
          <div 
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ 
              background: `linear-gradient(135deg, ${t.primary}12 0%, ${t.accent}08 100%)`, 
              border: `1px solid ${t.primary}20` 
            }}
          >
            <div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.15rem', color: t.text }}>
                Q&A Help Desk
              </h2>
              <p style={{ fontSize: '0.78rem', color: t.textMuted, marginTop: 4 }}>
                {isAdmin ? 'Review questions submitted by agents and provide answers.' : 'Ask questions or queries directly to the management team.'}
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => setAskModal(true)}
                className="btn-press px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
              >
                <Plus size={14} /> Ask Question
              </button>
            )}
          </div>

          {/* Questions lists */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse h-24 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 rounded-xl" style={{ color: t.overdue, background: `${t.overdue}11` }}>
              <ShieldAlert size={16} />
              <span className="text-xs font-semibold">{error}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {questions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                  <HelpCircle size={36} color={t.textMuted} className="mx-auto mb-2" />
                  <span style={{ fontSize: '0.85rem', color: t.textMuted }}>No questions have been submitted yet.</span>
                </div>
              ) : (
                questions.map(q => (
                  <div
                    key={q._id}
                    className="p-5 rounded-2xl flex flex-col gap-3.5"
                    style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[9px] font-bold px-2 py-0.5 rounded uppercase"
                          style={{
                            background: q.status === 'Answered' ? `${t.paid}20` : `${t.pending}20`,
                            color: q.status === 'Answered' ? t.paid : t.pending,
                          }}
                        >
                          {q.status}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: t.textMuted }}>
                          Asked by {q.employeeId?.name || 'Agent'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: t.textMuted }}>
                        {new Date(q.askedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Question body */}
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: t.text }}>
                      Q: {q.question}
                    </div>

                    {/* Answer area */}
                    {q.status === 'Answered' ? (
                      <div 
                        className="p-3.5 rounded-xl text-xs flex flex-col gap-1"
                        style={{ background: t.bgSubtle, borderLeft: `3px solid ${t.primary}` }}
                      >
                        <span style={{ fontWeight: 700, color: t.primary }}>
                          Answered by {q.answeredBy?.name || 'Management'}:
                        </span>
                        <span style={{ color: t.text }}>{q.answer}</span>
                      </div>
                    ) : (
                      isAdmin ? (
                        <button
                          onClick={() => { setSelectedQuestion(q); setAdminAnswer(''); }}
                          className="btn-press text-xs font-bold self-start mt-1"
                          style={{ color: t.primary, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          + Write Answer
                        </button>
                      ) : (
                        <div className="text-xs italic" style={{ color: t.textMuted }}>
                          Waiting for response...
                        </div>
                      )
                    )}

                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL: ASK A QUESTION (EMPLOYEE) */}
      {askModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setAskModal(false)}
        >
          <form 
            onSubmit={handleAsk}
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>Ask a Question</h3>
              <button type="button" onClick={() => setAskModal(false)} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>QUESTION CONTENT *</label>
              <textarea
                required
                placeholder="Type your question or query for management..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, minHeight: 120, padding: '12px', color: t.text, fontFamily: 'inherit', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={asking}
              className="btn-press w-full py-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
            >
              <Send size={14} /> {asking ? 'Sending...' : 'Send Question'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ANSWER A QUESTION (ADMIN) */}
      {selectedQuestion && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedQuestion(null)}
        >
          <form 
            onSubmit={handleAnswerSubmit}
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>Answer Question</h3>
              <button type="button" onClick={() => setSelectedQuestion(null)} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            <div className="text-xs p-3 rounded-xl mb-1" style={{ background: t.bgSubtle, border: `1px solid ${t.border}` }}>
              <span className="block font-bold" style={{ color: t.textMuted }}>QUESTION:</span>
              <span style={{ color: t.text }}>{selectedQuestion.question}</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>YOUR ANSWER *</label>
              <textarea
                required
                placeholder="Write response..."
                value={adminAnswer}
                onChange={e => setAdminAnswer(e.target.value)}
                style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, minHeight: 120, padding: '12px', color: t.text, fontFamily: 'inherit', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={answering}
              className="btn-press w-full py-3 rounded-xl font-bold"
              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
            >
              {answering ? 'Submitting...' : '✓ Submit Answer'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
