import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScopedStyle } from '../../components/ScopedStyle';
import css from './styles.css?inline';
import appCss from './app.css?inline';
import qaData from './qa_data.json';

type QA = {
  question: string;
  analysis: string;
  tags: string[];
  source: string;
};

const qas = qaData as QA[];
const ITEMS_PER_PAGE = 12;

export default function QaApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>(['全部']);
    qas.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, []);

  const filteredQAs = useMemo(() => {
    const kw = searchTerm.toLowerCase();
    return qas.filter((item) => {
      const matchesSearch =
        item.question.toLowerCase().includes(kw) || item.analysis.toLowerCase().includes(kw);
      const matchesTag = selectedTag === '全部' || item.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  const totalPages = Math.ceil(filteredQAs.length / ITEMS_PER_PAGE);

  const paginatedQAs = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQAs.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredQAs, currentPage]);

  // 筛选条件变化时回到第一页
  const [prevSearch, setPrevSearch] = useState(searchTerm);
  const [prevTag, setPrevTag] = useState(selectedTag);
  if (prevSearch !== searchTerm || prevTag !== selectedTag) {
    setPrevSearch(searchTerm);
    setPrevTag(selectedTag);
    setCurrentPage(1);
  }

  return (
    <>
      <ScopedStyle css={`${css}\n${appCss}`} />
      <div className="app-container">
      <div className="app-bg"></div>

      <header>
        <div className="logo-container">
          <h1>西游·启示录</h1>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="探寻西游权谋与真相..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="tags-filter">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      <main className="qa-grid">
        {paginatedQAs.map((item, index) => (
          <div className="qa-card" key={index}>
            <span className="source-tag">{item.source.replace('QA_Set_', '辑 ')}</span>
            <h3>{item.question}</h3>
            <div className="analysis markdown-content">
              <ReactMarkdown>{item.analysis}</ReactMarkdown>
            </div>
            <div className="card-tags">
              {item.tags.map((tag) => (
                <span key={tag} className="tag-item">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </main>

      {filteredQAs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
          <p>未找到相关启示，或可换个关键词搜寻...</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </button>

          <div className="pagination-pages">
            {currentPage > 3 && (
              <>
                <button className="pagination-page-btn" onClick={() => setCurrentPage(1)}>
                  1
                </button>
                {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
              </>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page >= currentPage - 2 && page <= currentPage + 2)
              .map((page) => (
                <button
                  key={page}
                  className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                <button
                  className="pagination-page-btn"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>

          <div className="pagination-jump">
            <span>跳转到</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder={String(currentPage)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const page = parseInt(e.currentTarget.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                  e.currentTarget.value = '';
                }
              }}
            />
            <span>页</span>
          </div>

          <span className="pagination-info">
            共 {filteredQAs.length} 条 · {totalPages} 页
          </span>
        </div>
      )}
      </div>
    </>
  );
}
