import { useState } from 'react';
import { useTournament } from '@/context/TournamentContext';
import { Shield, Lock, Send, Clock, User, Trophy } from 'lucide-react';

export default function PredictorPage() {
    const { teams, matches, predictions, addPrediction, isPredictorOpen, tournamentStarted } = useTournament();

    const finalMatch = matches.find(m => m.isFinal);
    const isFinalOver = finalMatch?.status === 'completed';

    const [userName, setUserName] = useState('');
    const [finalist1Id, setFinalist1Id] = useState('');
    const [finalist2Id, setFinalist2Id] = useState('');
    const [predictedWinnerId, setPredictedWinnerId] = useState('');
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || !finalist1Id || !finalist2Id || !predictedWinnerId || homeScore === '' || awayScore === '') return;

        addPrediction({
            userName: userName.trim(),
            finalist1Id,
            finalist2Id,
            predictedWinnerId,
            homeScore: parseInt(homeScore),
            awayScore: parseInt(awayScore),
        });

        setSubmitSuccess(true);
        setTimeout(() => {
            setUserName('');
            setFinalist1Id('');
            setFinalist2Id('');
            setPredictedWinnerId('');
            setHomeScore('');
            setAwayScore('');
            setSubmitSuccess(false);
        }, 2500);
    };

    const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown Team';

    if (!tournamentStarted) {
        return (
            <div className="container py-8 flex flex-col items-center justify-center text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-xl font-display text-foreground mb-2">Tournament Hasn't Started</h2>
                <p className="text-muted-foreground text-sm">The predictor will open once the tournament begins.</p>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="font-display text-3xl tracking-wide text-foreground">FINAL PREDICTOR</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Submission Form Area */}
                <div>
                    <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden">
                        {!isPredictorOpen && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                                <Lock className="h-10 w-10 text-destructive mb-3" />
                                <h3 className="font-display text-xl text-foreground mb-1">Predictions Closed</h3>
                                <p className="text-sm text-muted-foreground">Match Day 3 has concluded. No more predictions are being accepted.</p>
                            </div>
                        )}

                        <h2 className="text-lg font-semibold text-foreground mb-4">Make Your Prediction</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        required
                                        value={userName}
                                        onChange={e => setUserName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finalists</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        required
                                        value={finalist1Id}
                                        onChange={e => setFinalist1Id(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary"
                                    >
                                        <option value="">Select Team 1</option>
                                        {teams.filter(t => t.id !== finalist2Id).map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-muted-foreground font-semibold">vs</span>
                                    <select
                                        required
                                        value={finalist2Id}
                                        onChange={e => setFinalist2Id(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary"
                                    >
                                        <option value="">Select Team 2</option>
                                        {teams.filter(t => t.id !== finalist1Id).map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {finalist1Id && finalist2Id && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Predicted Winner</label>
                                        <select
                                            required
                                            value={predictedWinnerId}
                                            onChange={e => setPredictedWinnerId(e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary"
                                        >
                                            <option value="">Who will win?</option>
                                            <option value={finalist1Id}>{getTeamName(finalist1Id)}</option>
                                            <option value={finalist2Id}>{getTeamName(finalist2Id)}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final Score</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-md">
                                                <span className="text-xs text-muted-foreground truncate mr-2 w-20">{getTeamName(finalist1Id)}</span>
                                                <input type="number" min={0} required value={homeScore} onChange={e => setHomeScore(e.target.value)} className="w-12 bg-transparent text-right text-sm font-semibold text-foreground focus:outline-none" placeholder="0" />
                                            </div>
                                            <span className="text-xs text-muted-foreground font-semibold">-</span>
                                            <div className="flex-1 flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-md">
                                                <input type="number" min={0} required value={awayScore} onChange={e => setAwayScore(e.target.value)} className="w-12 bg-transparent text-sm font-semibold text-foreground focus:outline-none" placeholder="0" />
                                                <span className="text-xs text-muted-foreground truncate ml-2 w-20 text-right">{getTeamName(finalist2Id)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={!isPredictorOpen || submitSuccess}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {submitSuccess ? (
                                    "Prediction Submitted!"
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" /> Submit Prediction
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Prediction Feed Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Recent Predictions</h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {predictions.length} submitted
                        </div>
                    </div>

                    <div className="space-y-3">
                        {predictions.length === 0 ? (
                            <div className="bg-surface/50 border border-border/50 rounded-lg p-8 text-center">
                                <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No predictions yet. Be the first!</p>
                            </div>
                        ) : (
                            [...predictions].reverse().map(pred => (
                                <div key={pred.id} className="bg-card border border-border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-semibold text-sm text-foreground">{pred.userName}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(pred.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="flex items-center justify-between bg-surface/50 rounded-md p-2 px-3 border border-border/50">
                                        {!isFinalOver ? (
                                            <div className="w-full flex items-center justify-center gap-2 text-muted-foreground/70 py-1">
                                                <Lock className="h-3 w-3" />
                                                <span className="text-xs uppercase tracking-wider font-semibold">Prediction Hidden Until Full Time</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className={`text-xs font-semibold flex-1 truncate ${pred.predictedWinnerId === pred.finalist1Id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {getTeamName(pred.finalist1Id)}
                                                </span>
                                                <div className="flex items-center gap-2 font-display text-lg px-2">
                                                    <span>{pred.homeScore}</span>
                                                    <span className="text-muted-foreground text-[10px] uppercase">vs</span>
                                                    <span>{pred.awayScore}</span>
                                                </div>
                                                <span className={`text-xs font-semibold flex-1 text-right truncate ${pred.predictedWinnerId === pred.finalist2Id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {getTeamName(pred.finalist2Id)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
