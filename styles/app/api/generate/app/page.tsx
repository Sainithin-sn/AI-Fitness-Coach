"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Dumbbell, Utensils, Volume2, Download, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "", age: "", gender: "Male", weight: "", height: "",
    goal: "Weight Loss", location: "Gym", diet: "Non-Veg"
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePlan = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setPlan(data);
    } catch (error) {
      alert("Error generating plan.");
    } finally {
      setLoading(false);
    }
  };

  const speakPlan = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser does not support text-to-speech");
    }
  };

  const exportPDF = async () => {
    if (!planRef.current) return;
    const canvas = await html2canvas(planRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("My_Fitness_Plan.pdf");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-12 text-center pt-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI FIT-COACH
          </h1>
          <p className="text-neutral-400 mt-3 text-lg">Voice-Enabled • Visualized • Personalized</p>
        </header>

        {!plan && (
          <motion.form 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            onSubmit={generatePlan} 
            className="bg-neutral-900/50 backdrop-blur-lg p-8 rounded-3xl border border-neutral-800 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Full Name</label>
                <input name="name" onChange={handleChange} className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Age</label>
                <input name="age" type="number" onChange={handleChange} className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Weight (kg)</label>
                <input name="weight" type="number" onChange={handleChange} className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Height (cm)</label>
                <input name="height" type="number" onChange={handleChange} className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none" required />
              </div>
              
              <select name="gender" onChange={handleChange} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <option>Male</option><option>Female</option>
              </select>
              <select name="goal" onChange={handleChange} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <option>Weight Loss</option><option>Muscle Gain</option><option>Athletic Performance</option>
              </select>
              <select name="location" onChange={handleChange} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <option>Gym</option><option>Home</option><option>Outdoor</option>
              </select>
              <select name="diet" onChange={handleChange} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <option>Non-Veg</option><option>Veg</option><option>Vegan</option><option>Keto</option>
              </select>
            </div>

            <button 
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Generate My Plan 🚀"}
            </button>
          </motion.form>
        )}

        {loading && (
          <div className="text-center py-32">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-xl text-neutral-300 animate-pulse">Analyzing biometrics & crafting routine...</p>
          </div>
        )}

        {plan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-wrap gap-4 justify-end">
               <button onClick={() => speakPlan(plan.motivation)} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition text-sm">
                 <Volume2 size={16} /> Read Motivation
               </button>
               <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition text-sm font-semibold">
                 <Download size={16} /> Save PDF
               </button>
               <button onClick={() => setPlan(null)} className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-full hover:bg-red-900/50 transition text-sm">
                 <RefreshCw size={16} /> Reset
               </button>
            </div>

            <div ref={planRef} className="bg-neutral-950 p-4 space-y-8">
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 p-8 rounded-3xl border border-neutral-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <h3 className="text-2xl font-bold text-white mb-2">Coach's Message</h3>
                <p className="italic text-lg text-neutral-300">"{plan.motivation}"</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
                     <Dumbbell /> Workout Routine
                   </h2>
                   {plan.workout?.map((day: any, idx: number) => (
                     <div key={idx} className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
                       <h3 className="font-bold text-xl mb-4 text-white border-b border-neutral-800 pb-2">{day.day} • {day.focus}</h3>
                       <div className="space-y-4">
                         {day.exercises.map((ex: any, i: number) => (
                           <div key={i} className="flex gap-4 items-start">
                             <img 
                               src={`https://image.pollinations.ai/prompt/${encodeURIComponent(ex.visual_prompt)}?width=100&height=100&nologo=true`}
                               alt={ex.name}
                               className="w-16 h-16 rounded-lg object-cover bg-neutral-800"
                             />
                             <div>
                               <p className="font-bold text-neutral-200">{ex.name}</p>
                               <p className="text-sm text-neutral-500">{ex.sets}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                </div>

                <div className="space-y-4">
                   <h2 className="text-2xl font-bold flex items-center gap-2 text-green-400">
                     <Utensils /> Nutrition Plan
                   </h2>
                   <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-6">
                      {plan.diet?.meals?.map((meal: any, idx: number) => (
                        <div key={idx} className="group">
                          <div className="mb-2 flex justify-between items-center">
                             <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Meal {idx + 1}</span>
                             <span className="text-xs text-neutral-500">{meal.calories} kcal</span>
                          </div>
                          <div className="relative overflow-hidden rounded-xl h-32">
                             <img 
                               src={`https://image.pollinations.ai/prompt/${encodeURIComponent(meal.visual_prompt)}?width=400&height=200&nologo=true`}
                               alt={meal.name}
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             />
                             <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 backdrop-blur-sm">
                               <p className="font-bold text-white text-center">{meal.name}</p>
                             </div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
