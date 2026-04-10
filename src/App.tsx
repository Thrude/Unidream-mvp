import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";
import { 
  GraduationCap, 
  Zap, 
  Target, 
  Lightbulb, 
  Users, 
  ArrowRight, 
  Loader2,
  Sparkles,
  Award,
  BookOpen,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { analyzeAdmissionChances } from "./services/geminiService";
import { AdmissionStats, AdmissionBlueprint } from "./types";
import { cn } from "@/lib/utils";

const DEFAULT_STATS: AdmissionStats = {
  gpa: 3.5,
  sat: 1200,
  apClasses: 2,
  extracurriculars: "",
};

const INITIAL_BLUEPRINT: AdmissionBlueprint = {
  scores: {
    academics: 50,
    leadership: 50,
    impact: 50,
    innovation: 50,
    softSkills: 50,
  },
  recommendation: "Enter your stats and activities to see your admission blueprint.",
  matches: [
    { tier: "Safety", universities: ["Local State University"] },
    { tier: "Target", universities: ["Regional College"] },
    { tier: "Reach", universities: ["Top Tier University"] },
  ],
};

export default function App() {
  const [stats, setStats] = useState<AdmissionStats>(DEFAULT_STATS);
  const [blueprint, setBlueprint] = useState<AdmissionBlueprint>(INITIAL_BLUEPRINT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = [
    { subject: "Academics", A: blueprint.scores.academics, fullMark: 100 },
    { subject: "Leadership", A: blueprint.scores.leadership, fullMark: 100 },
    { subject: "Impact", A: blueprint.scores.impact, fullMark: 100 },
    { subject: "Innovation", A: blueprint.scores.innovation, fullMark: 100 },
    { subject: "Soft Skills", A: blueprint.scores.softSkills, fullMark: 100 },
  ];

  // Local heuristic for instant feedback
  useEffect(() => {
    const academics = Math.min(100, (stats.gpa / 4.0) * 60 + (stats.sat / 1600) * 30 + (stats.apClasses / 10) * 10);
    const leadership = Math.min(100, stats.extracurriculars.length > 0 ? 40 + Math.min(60, stats.extracurriculars.split(" ").length / 2) : 20);
    const impact = Math.min(100, stats.extracurriculars.length > 50 ? 50 + stats.apClasses * 5 : 30);
    const innovation = Math.min(100, stats.extracurriculars.toLowerCase().includes("founded") || stats.extracurriculars.toLowerCase().includes("created") ? 85 : 40);
    const softSkills = Math.min(100, 50 + (stats.extracurriculars.length / 100) * 10);

    setBlueprint(prev => ({
      ...prev,
      scores: {
        academics: Math.round(academics) || 0,
        leadership: Math.round(leadership) || 0,
        impact: Math.round(impact) || 0,
        innovation: Math.round(innovation) || 0,
        softSkills: Math.round(softSkills) || 0,
      }
    }));
  }, [stats]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeAdmissionChances(stats);
      setBlueprint(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze profile. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Force dark mode for the Linear.app aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">UniDream</span>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase opacity-50">
            v1.0 MVP
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Profile Levers</h1>
              <p className="text-muted-foreground">Adjust your stats to see how they impact your admission chances.</p>
            </div>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  Academics
                </CardTitle>
                <CardDescription>Your quantitative performance metrics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="gpa">Cumulative GPA</Label>
                    <span className="text-sm font-mono text-primary">{stats.gpa.toFixed(2)}</span>
                  </div>
                  <Select 
                    value={stats.gpa.toString()} 
                    onValueChange={(v) => setStats(s => ({ ...s, gpa: parseFloat(v) }))}
                  >
                    <SelectTrigger id="gpa">
                      <SelectValue placeholder="Select GPA" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 21 }, (_, i) => (2.0 + i * 0.1).toFixed(1)).map((val) => (
                        <SelectItem key={val} value={val}>{val}</SelectItem>
                      ))}
                      <SelectItem value="4.0">4.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="sat" className="text-sm font-medium">SAT Score</Label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      id="sat" 
                      min="400" 
                      max="1600" 
                      step="10" 
                      value={stats.sat}
                      onChange={(e) => setStats(s => ({ ...s, sat: parseInt(e.target.value) }))}
                      className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-mono text-primary min-w-[4ch] text-right">{stats.sat || 0}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>400</span>
                    <span>1600</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="ap">AP / IB Classes</Label>
                    <span className="text-sm font-mono text-primary">{stats.apClasses}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setStats(s => ({ ...s, apClasses: Math.max(0, s.apClasses - 1) }))}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center font-mono text-lg">{stats.apClasses || 0}</div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setStats(s => ({ ...s, apClasses: Math.min(15, s.apClasses + 1) }))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Extracurriculars
                </CardTitle>
                <CardDescription>Describe your impact outside the classroom.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ec">Activities & Achievements</Label>
                  <Textarea 
                    id="ec"
                    placeholder="E.g., Founded a coding club, Varsity Tennis captain, Volunteered 100+ hours at local hospital..."
                    className="min-h-[150px] resize-none bg-background/50"
                    value={stats.extracurriculars}
                    onChange={(e) => setStats(s => ({ ...s, extracurriculars: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full group" 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with Gemini...
                    </>
                  ) : (
                    <>
                      Calculate Admission Blueprint
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Visualization & Insights */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Instant Output</h2>
              <p className="text-muted-foreground">Your profile visualized across five key success dimensions.</p>
            </div>

            {/* Score Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { id: "acad", label: "Academics", color: "#7c6df8", val: blueprint.scores.academics, source: "formula" },
                { id: "lead", label: "Leadership", color: "#4fa8e8", val: blueprint.scores.leadership, source: blueprint.recommendation === INITIAL_BLUEPRINT.recommendation ? "awaiting AI" : "AI analysis" },
                { id: "impact", label: "Impact", color: "#2dd4aa", val: blueprint.scores.impact, source: blueprint.recommendation === INITIAL_BLUEPRINT.recommendation ? "awaiting AI" : "AI analysis" },
                { id: "innov", label: "Innovation", color: "#f59e3a", val: blueprint.scores.innovation, source: blueprint.recommendation === INITIAL_BLUEPRINT.recommendation ? "awaiting AI" : "AI analysis" },
                { id: "soft", label: "Soft Skills", color: "#ef5050", val: blueprint.scores.softSkills, source: blueprint.recommendation === INITIAL_BLUEPRINT.recommendation ? "awaiting AI" : "AI analysis" },
              ].map((score) => (
                <Card key={score.id} id={`card-${score.id}`} className="border-border/40 bg-card/50 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center space-y-1">
                  <div className="text-2xl font-mono font-bold" style={{ color: score.color }}>
                    {score.val || "—"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-foreground/70">
                    {score.label}
                  </div>
                  <div className="text-[9px] font-mono opacity-40 uppercase tracking-tighter">
                    {score.source}
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm md:col-span-1 overflow-hidden">
                <div className="h-[350px] w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500 }} 
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Student"
                        dataKey="A"
                        stroke="#7c6df8"
                        fill="#7c6df8"
                        fillOpacity={0.5}
                        animationDuration={1000}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Insight Box */}
              <div className="md:col-span-1 space-y-6">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Admission Blueprint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <p className="text-sm leading-relaxed text-muted-foreground italic">
                        "{blueprint.recommendation}"
                      </p>
                    </div>
                    
                    <Separator className="bg-border/40" />
                    
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        University Matches
                      </h3>
                      <div className="space-y-3">
                        {blueprint.matches.map((match) => (
                          <div key={match.tier} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded",
                                match.tier === "Reach" ? "bg-red-500/10 text-red-500" :
                                match.tier === "Target" ? "bg-blue-500/10 text-blue-500" :
                                "bg-green-500/10 text-green-500"
                              )}>
                                {match.tier}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {match.universities.map((uni) => (
                                <Badge key={uni} variant="secondary" className="bg-secondary/30 hover:bg-secondary/50 text-[10px]">
                                  {uni}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors"><GraduationCap className="w-5 h-5" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Zap className="w-5 h-5" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><BookOpen className="w-5 h-5" /></a>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            © 2026 UniDream. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
