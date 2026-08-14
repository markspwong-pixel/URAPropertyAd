import React, { useEffect } from 'react';
import { MessageSquare, MessageCircle, ShieldCheck } from 'lucide-react';

interface DisqusCommentsProps {
  pageUrl?: string;
  pageIdentifier?: string;
  title?: string;
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: () => void;
      }) => void;
    };
    disqus_config?: () => void;
  }
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  pageUrl,
  pageIdentifier = 'singapore-property-investor-advisor-main',
  title = 'Singapore Property Investor Community Discussion'
}) => {
  useEffect(() => {
    const currentUrl = pageUrl || window.location.href;
    const currentId = pageIdentifier;
    const currentTitle = title;

    try {
      window.disqus_config = function (this: any) {
        this.page.url = currentUrl;
        this.page.identifier = currentId;
        this.page.title = currentTitle;
      };

      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: window.disqus_config,
        });
      } else {
        const existingScript = document.querySelector('script[src*="mark-or4q4t384v.disqus.com/embed.js"]');
        if (!existingScript) {
          const d = document;
          const s = d.createElement('script');
          s.src = 'https://mark-or4q4t384v.disqus.com/embed.js';
          s.setAttribute('data-timestamp', String(+new Date()));
          s.async = true;
          s.onerror = () => {
            console.warn('Disqus embed script failed to load (possibly blocked by privacy settings or sandbox).');
          };
          (d.head || d.body).appendChild(s);
        }
      }

      // Load or reload count.js for comment counting
      const existingCountScript = document.getElementById('dsq-count-scr');
      if (!existingCountScript) {
        const countScript = document.createElement('script');
        countScript.id = 'dsq-count-scr';
        countScript.src = 'https://mark-or4q4t384v.disqus.com/count.js';
        countScript.async = true;
        countScript.onerror = () => {
          console.warn('Disqus count script failed to load.');
        };
        (document.head || document.body).appendChild(countScript);
      }
    } catch (e) {
      console.warn('Disqus initialization caught error:', e);
    }
  }, [pageUrl, pageIdentifier, title]);

  return (
    <section className="mt-12 space-y-4" aria-label="Investor Community Discussion">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                COMMUNITY FORUM & ANALYSIS
              </span>
              <span className="text-xs text-slate-400">Institutional & Retail Investor Discussions</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Investor Community Discussion</span>
              {/* Disqus comment count badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <MessageCircle className="w-3 h-3" />
                <span
                  className="disqus-comment-count font-mono"
                  data-disqus-identifier={pageIdentifier}
                >
                  Comments
                </span>
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Share transaction insights, URA master plan evaluations, rental yield feedback, or ask questions on specific districts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 border border-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-md shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Moderated Real Estate Discussion</span>
          </div>
        </div>

        {/* Disqus Embed Container */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md min-h-[220px]">
            <div id="disqus_thread" className="w-full" />
            <noscript>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                Please enable JavaScript to view the{' '}
                <a
                  href="https://disqus.com/?ref_noscript"
                  rel="nofollow noopener noreferrer"
                  className="underline font-semibold text-amber-400 hover:text-amber-300"
                >
                  comments powered by Disqus.
                </a>
              </div>
            </noscript>
          </div>
        </div>
      </div>
    </section>
  );
};
