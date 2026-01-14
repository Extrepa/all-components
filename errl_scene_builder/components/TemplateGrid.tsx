import React from "react";
import { templateSummaries, loadTemplate, createBlankScene } from "../templates/manifest";
import { useSceneStore } from "../scene/store";
import { useNavigate } from "react-router-dom";

/**
 * TemplateGrid
 *
 * Landing-style grid to pick a template or a blank scene.
 */
export const TemplateGrid: React.FC = () => {
  const setScene = useSceneStore((s) => s.setScene);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060712] text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#5be0ff]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff7ad1]/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl space-y-10 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-[#5be0ff] via-[#8be9ff] to-[#ff7ad1] bg-clip-text text-transparent drop-shadow-sm">
            Errl Scene Builder
          </h1>
          <p className="text-[#9aa2c0] text-lg max-w-md mx-auto">
            Compose scenes, arrange assets, and build the universe.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          
          {/* New Scene Card */}
          <button
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#5be0ff]/40 transition-all duration-200 min-h-[240px]"
            onClick={() => {
              setScene(createBlankScene());
              navigate("/editor");
            }}
          >
            <div className="w-14 h-14 rounded-full bg-[#5be0ff]/10 border border-[#5be0ff]/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#5be0ff]/20 transition-all duration-200">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5be0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="text-lg font-bold text-white/90 group-hover:text-white">Blank Scene</div>
            <div className="text-sm text-[#9aa2c0] mt-1 group-hover:text-white/70">Start from scratch</div>
          </button>

          {/* Template Cards */}
          {templateSummaries.map((tpl) => (
            <button
              key={tpl.id}
              className="group flex flex-col text-left p-0 rounded-2xl border border-white/10 bg-[#0e1022] hover:border-[#5be0ff]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              onClick={async () => {
                const scene = await loadTemplate(tpl);
                setScene(scene);
                navigate("/editor");
              }}
            >
              {/* Visual Placeholder */}
              <div className="h-36 w-full bg-gradient-to-br from-white/5 to-[#060712] relative overflow-hidden border-b border-white/5 group-hover:border-white/10 transition-colors">
                <div className="absolute inset-0 opacity-20" style={{ 
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                }}></div>
                
                {/* Dynamic colored blob based on ID for variety */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-[40px] opacity-30 group-hover:opacity-50 transition-opacity duration-300
                    ${tpl.id.includes('LAB') ? 'bg-cyan-500' : 
                      tpl.id.includes('TV') ? 'bg-purple-500' :
                      tpl.id.includes('STAGE') ? 'bg-orange-500' : 
                      tpl.id.includes('VOID') ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                 />
                 
                 {/* Icon/Symbol overlay */}
                 <div className="absolute bottom-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                       <circle cx="12" cy="12" r="10" />
                    </svg>
                 </div>
              </div>

              <div className="p-5 flex flex-col gap-2 flex-1 bg-[#0e1022]">
                <div className="font-bold text-lg text-white/90 group-hover:text-[#5be0ff] transition-colors">
                    {tpl.label}
                </div>
                <div className="text-sm text-[#9aa2c0] leading-relaxed line-clamp-2 group-hover:text-white/70 transition-colors">
                    {tpl.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Footer / Version */}
        <div className="text-center pt-8 text-xs text-white/20 font-mono">
          v0.1.0 • Internal Build
        </div>
      </div>
    </div>
  );
};
