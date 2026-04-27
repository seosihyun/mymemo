/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Tag as TagIcon, 
  Hash,
  LayoutGrid,
  Clock,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

// --- Initial Seed Data ---
const SEED_NOTES: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "1. 여백은 8의 배수로 설정\n2. 컬러 팔레트는 브랜드 테마 준수\n3. 다크 모드 대응 필수",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴의 아름다움",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "AI 기반 일정 관리 도구 만들기. React와 Gemini API 연동 고려.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString()
  }
];

const STORAGE_KEY = "mymemo.notes";

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEED_NOTES;
      }
    }
    return SEED_NOTES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Note Form State
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTags, setFormTags] = useState("");

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // --- Derived State ---
  const allTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, selectedTag]);

  // --- Handlers ---
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== "");

    const newNote: Note = {
      id: Date.now(),
      title: formTitle || "제목 없음",
      body: formBody,
      tags: tagsArray,
      updatedAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    closeModal();
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("이 메모를 삭제할까요?")) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const openModal = () => {
    setFormTitle("");
    setFormBody("");
    setFormTags("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // --- UI Components ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setSelectedTag(null); setSearchQuery("");}}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-indigo-200">
              M
            </div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-600">MyMemo</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
          <div className="mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</div>
          <button 
            onClick={() => setSelectedTag(null)}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-200 group ${
              selectedTag === null ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutGrid className={`w-4 h-4 ${selectedTag === null ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              전체
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTag === null ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
              {notes.length}
            </span>
          </button>

          <div className="mt-8 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-xs">태그</div>
          <div className="space-y-0.5">
            {allTags.map(([tag, count]) => (
              <button 
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-200 group ${
                  selectedTag === tag ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3 truncate">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    tag === "디자인" ? "bg-blue-400" : 
                    tag === "개발" ? "bg-emerald-400" : 
                    tag === "업무" ? "bg-amber-400" : "bg-slate-300"
                  }`} />
                  {tag}
                </span>
                <span className={`text-[10px] ${selectedTag === tag ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-tighter">데이터 상태</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              localStorage 연결됨
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="메모, 태그, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm"
            />
          </div>

          <button 
            onClick={openModal}
            className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100 active:scale-95 font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">새 메모</span>
          </button>
        </header>

        {/* Content Grid */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {selectedTag ? `#${selectedTag}` : '모든 메모'}
                {searchQuery && <span className="ml-3 text-slate-400 text-lg font-normal tracking-normal italic">"{searchQuery}" 검색 결과</span>}
              </h2>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                {filteredNotes.length}개
              </div>
            </div>

            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all cursor-pointer flex flex-col min-h-[200px]"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <h3 className="font-bold text-lg mb-2 text-slate-800 pr-8 line-clamp-2 leading-tight">{note.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-4 whitespace-pre-wrap flex-1">
                        {note.body}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {note.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-tighter">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter tabular-nums">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                <div className="w-20 h-20 bg-white border border-dashed border-slate-200 rounded-3xl flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-xl font-bold text-slate-400">메모를 찾을 수 없습니다.</p>
                <p className="text-sm mt-1">검색어나 필터를 변경해 보세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal - Modern Styled */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden shadow-slate-900/20"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">새 메모 작성</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">생각을 기록하세요</p>
                </div>
                <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">제목</label>
                  <input 
                    type="text" 
                    placeholder="제목을 입력하세요"
                    autoFocus
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none text-lg font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">내용</label>
                  <textarea 
                    placeholder="무슨 생각을 하고 있나요?"
                    rows={5}
                    required
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none resize-none text-slate-700 leading-relaxed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">태그 (쉼표 구분)</label>
                  <div className="relative">
                    <TagIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="업무, 디자인, 아이디어..."
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none text-slate-700 font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 px-6 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          onClick={openModal}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-300 active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
