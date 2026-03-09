import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { FileText, Loader2, TrendingUp, DollarSign, PieChart, Download } from 'lucide-react';
import Markdown from 'react-markdown';

interface FinancialReportProps {
  language: string;
  t: any;
}

export const FinancialReport: React.FC<FinancialReportProps> = ({ language, t }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a professional financial report for GUSCHALL APPS based on simulated inventory data. 
        The report should include:
        1. Summary of total stock value.
        2. Top performing categories.
        3. Financial projections for the next quarter.
        4. Recommendations for optimization.
        Language: ${language === 'pl' ? 'Polish' : language === 'de' ? 'German' : 'English'}.
        Format: Professional Markdown.`,
      });
      setReport(response.text || "Failed to generate report.");
    } catch (err) {
      console.error(err);
      setReport("Error generating report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      {!report && !isGenerating && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-pro-blue/10 flex items-center justify-center border border-pro-blue/20">
              <TrendingUp className="w-10 h-10 text-pro-blue" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold uppercase tracking-tight">{t.financialReport}</h2>
            <p className="text-white/40 max-w-md mx-auto">
              Analyze your inventory data and generate comprehensive financial insights using Gemini 3.1 Pro.
            </p>
          </div>
          <button 
            onClick={generateReport}
            className="gold-button px-12"
          >
            GENERATE REPORT
          </button>
        </motion.div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-pro-blue animate-spin" />
          <p className="text-pro-blue font-bold uppercase tracking-widest animate-pulse">
            {t.generatingReport}
          </p>
        </div>
      )}

      {report && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-5 h-5 text-pro-blue" />
              Report Output
            </h2>
            <button 
              onClick={() => setReport(null)}
              className="text-white/40 hover:text-white text-xs uppercase tracking-widest"
            >
              New Report
            </button>
          </div>
          
          <div className="glass-panel p-8 prose prose-invert max-w-none border-pro-blue/10">
            <div className="markdown-body">
              <Markdown>{report}</Markdown>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 glass-panel p-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" />
              <span>EXPORT PDF</span>
            </button>
            <button className="flex-1 glass-panel p-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <PieChart className="w-4 h-4" />
              <span>VISUALIZE DATA</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
