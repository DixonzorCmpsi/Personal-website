"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlobalChat from './GlobalChat';

// Premium Modal Template
const Modal = ({ title, isOpen, onClose, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/50 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors text-xl">
          ✕
        </button>
        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase italic">{title}</h2>
        {children}
      </div>
    </div>
  );
};

// Enhanced Project Modal
const ProjectModal = ({ project, onClose }: { project: any, onClose: () => void }) => {
  if (!project) return null;
  return (
    <Modal title={project.display_name} isOpen={!!project} onClose={onClose}>
      <div className="space-y-6">
        {project.stats?.image && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
            <Image
              src={project.stats.image}
              alt={project.display_name}
              fill
              className="object-contain"
              onError={(e: any) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex gap-4 items-center">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-widest">
            {project.stats?.language}
          </span>
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold">
            ★ {project.stats?.stars}
          </span>
        </div>

        <p className="text-slate-300 text-lg leading-relaxed font-light">
          {project.stats?.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Link
            href={project.stats?.url || "#"}
            target="_blank"
            className="group relative px-8 py-4 bg-white text-black rounded-xl font-black text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            EXPLORE CODEBASE
          </Link>
          <button className="px-8 py-4 bg-slate-800 text-white rounded-xl font-black text-center border border-white/10 hover:bg-slate-700 transition-all">
            AI ANALYSIS
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function FootballField({ qbData, rosterData, config }: any) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">

      {/* The Field Container */}
      <div className="relative w-full aspect-[16/9] bg-[#0f172a] rounded-[3rem] overflow-hidden border-[16px] border-white/5 shadow-[0_80px_150px_rgba(0,0,0,0.6)]">

        {/* Synthetic Field Background */}
        <div className="absolute inset-0 bg-[#064e3b] opacity-95 overflow-hidden">
          {/* Yard Lines */}
          <div className="absolute inset-0 flex justify-between px-0">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="h-full w-[2px] bg-white/5 relative">
                <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/10 uppercase tracking-tighter italic">{(10 * (i > 5 ? 10 - i : i))}</span>
              </div>
            ))}
          </div>
          {/* Boundary Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
        </div>

        {/* 1. The Quarterback (Main Profile) */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30"
          style={{ left: `${config.quarterback.x}%`, top: `${config.quarterback.y}%` }}
        >
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-3xl hover:bg-white/20 transition-all duration-700 w-40 h-32 md:w-60 md:h-48 flex flex-col items-center justify-center gap-4 shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/20 rounded-[2.5rem] group-hover:scale-105 group-hover:border-white/40">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[6px] border-white relative z-10 shadow-2xl transform group-hover:rotate-3 transition-transform">
              <Image src="/profile.jpg" alt="Profile" fill className="object-cover" />
            </div>
            <div className="flex flex-col items-center relative z-10">
              <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.4em] text-white italic">Lead Principal</span>
              <span className="text-[9px] text-blue-400 font-black tracking-widest uppercase mt-1">v.{new Date().getFullYear()}.alpha</span>
            </div>

            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-20 transition duration-700 -z-10"></div>
          </div>
        </div>

        {/* 2. The Roster (Projects / Links) */}
        {rosterData.map((project: any) => (
          <div
            key={project.position}
            onClick={() => project.type === 'repo' ? setSelectedProject(project) : window.open(project.url, '_blank')}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-700 z-20"
            style={{ left: `${project.x}%`, top: `${project.y}%` }}
          >
            <div className={`relative overflow-hidden w-28 h-20 md:w-44 md:h-32 flex flex-col items-center justify-center p-4 text-center shadow-3xl border border-white/10 rounded-3xl transition-all duration-700 backdrop-blur-xl group-hover:scale-110
              ${project.type === 'repo'
                ? 'bg-slate-950/60 hover:bg-slate-950/90 hover:border-white/30'
                : 'bg-indigo-950/40 hover:bg-indigo-950/80 hover:border-indigo-400/50'}`}>

              {/* Card Image Background */}
              {project.stats?.image && (
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Image src={project.stats.image} alt="bg" fill className="object-cover grayscale saturate-0 contrast-125" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-[1]"></div>

              <span className="text-3xl md:text-5xl mb-2 filter drop-shadow-2xl transform group-hover:-translate-y-2 transition-transform relative z-[2]">
                {project.icon || '📁'}
              </span>
              <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-white leading-tight relative z-[2] drop-shadow-lg">
                {project.display_name}
              </span>

              {project.type === 'repo' && project.stats?.language && (
                <div className="flex items-center gap-3 mt-3 opacity-80 group-hover:opacity-100 transition-opacity relative z-[2]">
                  <span className="text-[8px] md:text-[9px] bg-blue-500/30 text-blue-200 px-2.5 py-1 rounded-full font-black uppercase tracking-tighter border border-white/10">
                    {project.stats?.language}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] text-yellow-500 leading-none">★</span>
                    <span className="text-[10px] text-white font-black italic">{project.stats?.stars || 0}</span>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-8 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </div>
          </div>
        ))}

        {/* 3. The Chat Bot Interface - Seamless Integration */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[75%] z-40">
          <div className="bg-slate-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
            <GlobalChat />
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}
