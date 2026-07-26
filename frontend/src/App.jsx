import React, { useState, useRef, useEffect } from 'react';
import { JournalCanvas } from './components/JournalCanvas';
import { HandwritingRadarChart } from './components/HandwritingRadarChart';
import { MoodTrendChart } from './components/MoodTrendChart';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const canvasRef = useRef(null);
  const [sleepHours, setSleepHours] = useState('7.0');
  const [exerciseStatus, setExerciseStatus] = useState('no');
  const [strokes, setStrokes] = useState([]);
  const [eraseCount, setEraseCount] = useState(0);

  // Timer state
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Digital Detox (Jomblo Mode) state
  const [isDetoxActive, setIsDetoxActive] = useState(false);
  const [detoxTimer, setDetoxTimer] = useState(120);

  // API response / Analysis state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Custom states for simulated/actual data
  const [radarData, setRadarData] = useState([
    { subject: 'Kecepatan', value: 0 },
    { subject: 'Akselerasi', value: 0 },
    { subject: 'Jerk (Tremor)', value: 0 },
    { subject: 'Pen Lifts', value: 0 },
    { subject: 'Erase Count', value: 0 }
  ]);

  const [moodTrend, setMoodTrend] = useState([
    { date: 'Hari -3', mood: 65 },
    { date: 'Hari -2', mood: 70 },
    { date: 'Hari -1', mood: 58 },
    { date: 'Hari ini', mood: 50 },
    { date: 'Besok (Prediksi)', mood: 55 },
    { date: 'Lusa (Prediksi)', mood: 62 },
    { date: 'Hari +3 (Prediksi)', mood: 70 }
  ]);

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchHistory(historyRange);
    }
  }, [session, historyRange]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchHistory = async (range = 7) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`http://localhost:8000/api/history?range=${range}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.entries && data.entries.length > 0) {
        const trendData = data.entries.map((e, i) => ({
          date: new Date(e.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
          mood: e.mood_score,
        }));
        if (analysisResult?.future_mood_prediction) {
          const pred = analysisResult.future_mood_prediction;
          trendData.push(
            { date: 'H+1', mood: pred[0] },
            { date: 'H+2', mood: pred[1] },
            { date: 'H+3', mood: pred[2] },
            { date: 'H+4', mood: pred[3] },
          );
        }
        setMoodTrend(trendData);
      }
    } catch {}
  };

  // Crisis Alert State
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  // Trusted circle contacts
  const [contacts, setContacts] = useState([
    { name: 'Rian (Sahabat)', type: 'whatsapp', value: '+6281234567890' },
    { name: 'Ibu', type: 'email', value: 'ibu@family.com' }
  ]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactType, setNewContactType] = useState('email');
  const [newContactValue, setNewContactValue] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [historyRange, setHistoryRange] = useState(7);

  // Start duration timer when drawing starts
  useEffect(() => {
    if (strokes.length > 0 && !isTimerActive) {
      setIsTimerActive(true);
    }
  }, [strokes, isTimerActive]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && !loading) {
      interval = setInterval(() => {
        setDurationSeconds(d => d + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, loading]);

  // Digital Detox Countdown timer
  useEffect(() => {
    let detoxInterval = null;
    if (isDetoxActive && detoxTimer > 0) {
      detoxInterval = setInterval(() => {
        setDetoxTimer(t => t - 1);
      }, 1000);
    } else if (detoxTimer === 0) {
      setIsDetoxActive(false);
    }
    return () => clearInterval(detoxInterval);
  }, [isDetoxActive, detoxTimer]);

  const handleStrokeChange = (newStrokes) => {
    setStrokes(newStrokes);
  };

  const handleEraseCountChange = (count) => {
    setEraseCount(count);
  };

  const addContact = (e) => {
    e.preventDefault();
    if (!newContactName || !newContactValue) return;
    setContacts(prev => [...prev, {
      name: newContactName,
      type: newContactType,
      value: newContactValue
    }]);
    setNewContactName('');
    setNewContactValue('');
  };

  const base64ToBlob = (base64Str, mimeType) => {
    const byteString = atob(base64Str.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    setNotificationSent(false);

    try {
      const base64Image = await canvasRef.current?.exportImage();
      if (!base64Image) {
        throw new Error('Kanvas masih kosong. Silakan tulis sesuatu terlebih dahulu.');
      }

      const imageBlob = base64ToBlob(base64Image, 'image/png');
      const formData = new FormData();
      formData.append('file', imageBlob, 'journal.png');
      formData.append('strokes_json', JSON.stringify(strokes));
      formData.append('sleep_hours', parseFloat(sleepHours));
      formData.append('erase_count', parseInt(eraseCount));
      formData.append('duration_seconds', parseInt(durationSeconds) || 5);
      formData.append('exercise_status', exerciseStatus);

      const { data: { session } } = await supabase.auth.getSession();

      // Call API
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Gagal memproses analisis di backend.');
      }

      const result = await response.json();
      setAnalysisResult(result);

      // Map kinematics data to Radar Chart
      const velocityNorm = Math.min(100, Math.round((result.kinematics?.average_velocity || 0) * 1.5));
      const accelerationNorm = Math.min(100, Math.round((result.kinematics?.average_acceleration || 0) * 10));
      const jerkNorm = Math.min(100, Math.round((result.kinematics?.jerk_score || 0) * 0.5));
      const penLiftsNorm = Math.min(100, Math.round((result.kinematics?.pen_lifts || 0) * 12));
      const eraseCountNorm = Math.min(100, Math.round((result.kinematics?.erase_count || 0) * 20));

      setRadarData([
        { subject: 'Kecepatan', value: velocityNorm },
        { subject: 'Akselerasi', value: accelerationNorm },
        { subject: 'Jerk (Tremor)', value: jerkNorm },
        { subject: 'Pen Lifts', value: penLiftsNorm },
        { subject: 'Erase Count', value: eraseCountNorm }
      ]);

      // Map mood predictions to Line Chart
      if (result.future_mood_prediction && Array.isArray(result.future_mood_prediction)) {
        setMoodTrend([
          { date: 'Hari -3', mood: 65 },
          { date: 'Hari -2', mood: 70 },
          { date: 'Hari -1', mood: 58 },
          { date: 'Hari ini', mood: result.mood_score || 50 },
          { date: 'H+1 (Prediksi)', mood: result.future_mood_prediction[0] || 50 },
          { date: 'H+2 (Prediksi)', mood: result.future_mood_prediction[1] || 55 },
          { date: 'H+3 (Prediksi)', mood: result.future_mood_prediction[2] || 60 },
          { date: 'H+4 (Prediksi)', mood: result.future_mood_prediction[3] || 65 }
        ]);
      }

      fetchHistory(historyRange);

      // Check for crisis trigger
      const criticalKeywords = ['bunuh diri', 'menyerah', 'akhiri hidup', 'self-harm', 'potong urat', 'mati saja', 'ingin mati'];
      const ocrTextLower = (result.ocr_text || '').toLowerCase();
      const hasCrisis = criticalKeywords.some(keyword => ocrTextLower.includes(keyword));

      if (hasCrisis) {
        setShowCrisisModal(true);
        setNotificationSent(true);
      } else if (result.stress_score > 70) {
        setNotificationSent(true);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Koneksi ke backend gagal. Menggunakan data simulasi fallback.');

      // Fallback Mock Data Generation
      const mockResult = {
        ocr_text: "Refleksi hari ini cukup berat, merasa cemas menghadapi ujian esok hari.",
        sentiment_label: "Anxious",
        sentiment_score: 75,
        handwriting_insights: "Tekanan tulisan tangan stabil namun terdapat tremor halus pada beberapa huruf. Ini mengindikasikan ketegangan motorik ringan akibat cemas.",
        mood_stress_correlation: "Kurang tidur (7 jam) dipadukan dengan ketiadaan olahraga berkontribusi pada peningkatan jerk score. Menulis selama " + durationSeconds + " detik membantu menurunkan denyut nadi.",
        recommendations: "Latihan pernapasan box breathing: Tarik napas 4 detik, tahan 4 detik, embuskan 4 detik, tahan 4 detik. Lakukan 5 siklus.",
        stress_score: 65,
        mood_score: 45,
        future_mood_prediction: [50, 60, 68, 75]
      };

      setAnalysisResult(mockResult);

      // Map mock kinematics to Radar
      setRadarData([
        { subject: 'Kecepatan', value: 65 },
        { subject: 'Akselerasi', value: 45 },
        { subject: 'Jerk (Tremor)', value: 50 },
        { subject: 'Pen Lifts', value: 40 },
        { subject: 'Erase Count', value: eraseCount * 20 }
      ]);

      // Map mock prediction to Line Chart
      setMoodTrend([
        { date: 'Hari -3', mood: 65 },
        { date: 'Hari -2', mood: 70 },
        { date: 'Hari -1', mood: 58 },
        { date: 'Hari ini', mood: mockResult.mood_score },
        { date: 'H+1 (Prediksi)', mood: mockResult.future_mood_prediction[0] },
        { date: 'H+2 (Prediksi)', mood: mockResult.future_mood_prediction[1] },
        { date: 'H+3 (Prediksi)', mood: mockResult.future_mood_prediction[2] },
        { date: 'H+4 (Prediksi)', mood: mockResult.future_mood_prediction[3] }
      ]);

      // Mock crisis trigger if user drew suicide-like query mock
      if (strokes.length > 0 && eraseCount > 3) {
        // Just mock it for testing if they erased too much and wrote
        setNotificationSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    canvasRef.current?.clear();
    setStrokes([]);
    setEraseCount(0);
    setDurationSeconds(0);
    setIsTimerActive(false);
    setAnalysisResult(null);
    setNotificationSent(false);
    setErrorMsg('');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#7a3dff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-white text-[#080808] font-sans antialiased">
      {/* Navigation Bar */}
      <nav className="border-b border-[#d8d8d8] bg-white px-6 md:px-10 lg:px-16 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#7a3dff]"></span>
          <span className="text-lg font-semibold tracking-tight text-[#080808]">InkTrace AI</span>
          <span className="text-[10px] font-mono border border-[#3b89ff] text-[#3b89ff] px-1.5 py-0.5 rounded-[4px] ml-2 uppercase tracking-wider">Tugas 5</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#898989] font-mono hidden md:block">
            {session.user.email}
          </span>
          <button
            onClick={() => {
              setIsDetoxActive(true);
              setDetoxTimer(120);
            }}
            className="text-[12px] font-medium tracking-[0.05em] text-[#ff6b00] border border-[#ff6b00] hover:bg-[#fffbf9] uppercase px-3 py-1.5 rounded-[4px] transition-all cursor-pointer"
          >
            Digital Detox (Jomblo Mode)
          </button>
          <button
            onClick={handleLogout}
            className="text-[12px] font-medium tracking-[0.05em] text-[#898989] border border-[#d8d8d8] hover:bg-[#fafafa] px-3 py-1.5 rounded-[4px] transition-all cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[12px] font-medium tracking-[0.15em] text-[#5a5a5a] uppercase mb-2 block">Early Self-Awareness</span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#080808] leading-tight">
            Refleksi & Analisis Grafologi
          </h1>
          <p className="text-base text-[#5a5a5a] mt-2 max-w-2xl">
            Tulis jurnal refleksi harian Anda pada kanvas digital. Sistem akan melacak kinematika menulis Anda dan memberikan wawasan mental tanpa diagnosis klinis.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#fffbf9] border-l-4 border-[#ffae13] text-[#080808] p-4 rounded-[4px] mb-6 flex justify-between items-center">
            <div className="text-sm font-medium">{errorMsg}</div>
            <button onClick={() => setErrorMsg('')} className="text-xs hover:underline cursor-pointer">Tutup</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas and Log Form (2 cols in large screen) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Journal Canvas */}
            <JournalCanvas
              ref={canvasRef}
              onStrokeChange={handleStrokeChange}
              onEraseCountChange={handleEraseCountChange}
            />

            {/* Sleep & Exercise Logs (Accent Orange border) */}
            <div className="border-l-4 border-[#ff6b00] bg-[#fffbf9] rounded-r-[8px] p-6 space-y-4">
              <div>
                <span className="text-[11px] font-semibold tracking-[0.1em] text-[#ff6b00] uppercase block mb-1">Kebiasaan Sehat</span>
                <h4 className="text-lg font-medium text-[#080808]">Log Kebiasaan Hari Ini</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#363636] mb-1">Jam Tidur Semalam: {sleepHours} jam</label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full h-1.5 bg-[#d8d8d8] rounded-lg appearance-none cursor-pointer accent-[#ff6b00]"
                  />
                  <div className="flex justify-between text-xs text-[#898989] mt-1 font-mono">
                    <span>0 jam</span>
                    <span>6 jam</span>
                    <span>12 jam</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#363636] mb-1">Apakah Anda Olahraga Hari Ini?</label>
                  <select
                    value={exerciseStatus}
                    onChange={(e) => setExerciseStatus(e.target.value)}
                    className="w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 text-sm outline-none focus:border-[#ff6b00]"
                  >
                    <option value="no">Tidak</option>
                    <option value="yes">Ya (Minimal 15 menit)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#898989] font-mono">
                  Durasi Menulis: <strong className="text-[#080808]">{durationSeconds}s</strong> | Strokes: <strong className="text-[#080808]">{strokes.length}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="bg-white hover:bg-[#fafafa] text-[#080808] border border-[#d8d8d8] font-medium text-sm py-2 px-4 rounded-[4px] transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || strokes.length === 0}
                    className={`bg-[#080808] hover:bg-[#222222] text-white font-medium text-sm py-2 px-5 rounded-[4px] transition-all cursor-pointer inline-flex items-center gap-2 ${
                      (loading || strokes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Menganalisis...' : 'Kirim & Analisis'}
                  </button>
                </div>
              </div>
            </div>

            {/* Trusted Circle Configuration (Accent Pink border) */}
            <div className="border-l-4 border-[#ed52cb] bg-[#fffafc] rounded-r-[8px] p-6">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#ed52cb] uppercase block mb-1">Dukungan Sosial</span>
              <h4 className="text-lg font-medium text-[#080808] mb-3">Trusted Circle (Kontak Terdekat)</h4>

              <div className="space-y-2 mb-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-2.5 rounded-[4px] border border-[#d8d8d8] text-xs">
                    <div>
                      <strong className="text-[#080808]">{contact.name}</strong>
                      <span className="text-[#898989] ml-2">({contact.type})</span>
                    </div>
                    <span className="font-mono text-[#363636]">{contact.value}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={addContact} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nama"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-white text-xs text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 outline-none focus:border-[#ed52cb] md:col-span-1"
                />
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value)}
                  className="bg-white text-xs text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 outline-none focus:border-[#ed52cb]"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input
                  type="text"
                  placeholder="Nomor/Email"
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  className="bg-white text-xs text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 outline-none focus:border-[#ed52cb] md:col-span-2"
                />
                <button
                  type="submit"
                  className="bg-[#080808] hover:bg-[#222222] text-white text-xs py-2 px-3 rounded-[4px] transition-all cursor-pointer font-medium md:col-span-4"
                >
                  Tambah Kontak Baru
                </button>
              </form>

              {notificationSent && (
                <div className="mt-3 p-3 bg-white border border-[#ed52cb] text-[#ed52cb] rounded-[4px] text-xs font-medium animate-pulse flex items-center justify-between">
                  <span>🔔 Notifikasi otomatis sapaan terkirim ke Trusted Circle (Simulated)!</span>
                  <span className="text-[10px] font-mono bg-[#ed52cb]/10 px-1 py-0.5 rounded">Resend API + WA</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Visualizations & AI Insights (1 col) */}
          <div className="space-y-6">

            {/* Handwriting Radar Chart */}
            <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6 hover:shadow-[0_13px_13px_rgba(0,0,0,0.04)] transition-all">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase block mb-1">Analisis Fisik</span>
              <h4 className="text-lg font-medium text-[#080808] mb-3">Radar Kinematika</h4>
              <HandwritingRadarChart data={radarData} />
              <div className="text-[11px] text-[#898989] font-mono mt-3 leading-relaxed">
                Mengevaluasi karakteristik kecepatan, akselerasi, kegemeteran (jerk), angkatan pena, dan frekuensi penghapusan.
              </div>
            </div>

            {/* Mood Trend Chart */}
            <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6 hover:shadow-[0_13px_13px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.1em] text-[#3b89ff] uppercase block mb-1">Tren Kesehatan Mental</span>
                  <h4 className="text-lg font-medium text-[#080808]">Tren Mood & Prediksi</h4>
                </div>
                <select
                  value={historyRange}
                  onChange={(e) => setHistoryRange(parseInt(e.target.value))}
                  className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-2 py-1 text-[#080808] outline-none focus:border-[#3b89ff]"
                >
                  <option value={7}>7 hari</option>
                  <option value={30}>30 hari</option>
                  <option value={90}>90 hari</option>
                </select>
              </div>
              <MoodTrendChart data={moodTrend} />
              <div className="text-[11px] text-[#898989] font-mono mt-3 leading-relaxed">
                Menyajikan riwayat mood Anda saat ini dan memproyeksikan stabilitas emosi untuk 4 hari mendatang.
              </div>
            </div>

            {/* AI Insights Card */}
            {analysisResult && (
              <div className="border border-[#d8d8d8] rounded-[8px] bg-white p-6 hover:shadow-[0_13px_13px_rgba(0,0,0,0.04)] transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.1em] text-[#3b89ff] uppercase block mb-1">Refleksi LLM</span>
                    <h4 className="text-lg font-medium text-[#080808]">Hasil Analisis AI</h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 bg-[#fafafa] border border-[#d8d8d8] rounded-[4px]">
                      Sentimen: <strong className="text-[#7a3dff]">{analysisResult.sentiment_label}</strong>
                    </span>
                    <span className="text-[10px] text-[#898989] font-mono">Score: {analysisResult.sentiment_score}/100</span>
                  </div>
                </div>

                <div className="border-t border-[#d8d8d8] pt-3 space-y-3.5 text-xs text-[#363636]">
                  {analysisResult.ocr_text && (
                    <div>
                      <strong className="text-[#080808] block mb-0.5">Teks Terdeteksi (OCR):</strong>
                      <p className="bg-[#fafafa] p-2 rounded border border-[#d8d8d8] font-mono italic">"{analysisResult.ocr_text}"</p>
                    </div>
                  )}

                  <div>
                    <strong className="text-[#080808] block mb-0.5">Wawasan Tulisan:</strong>
                    <p className="leading-relaxed">{analysisResult.handwriting_insights}</p>
                  </div>

                  <div>
                    <strong className="text-[#080808] block mb-0.5">Korelasi Mood & Stres:</strong>
                    <p className="leading-relaxed">{analysisResult.mood_stress_correlation}</p>
                  </div>

                  <div className="p-3 bg-[#f9fcff] border-l-2 border-[#3b89ff] rounded-r">
                    <strong className="text-[#3b89ff] block mb-0.5">Rekomendasi (Mikro-Intervensi):</strong>
                    <p className="leading-relaxed text-[#363636] font-medium">{analysisResult.recommendations}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                    <div className="bg-[#fafafa] border border-[#d8d8d8] p-2 rounded">
                      <span className="text-[#898989] block">Stress Score</span>
                      <strong className="text-base text-[#ff6b00]">{analysisResult.stress_score || 0}</strong>
                    </div>
                    <div className="bg-[#fafafa] border border-[#d8d8d8] p-2 rounded">
                      <span className="text-[#898989] block">Mood Score</span>
                      <strong className="text-base text-[#3b89ff]">{analysisResult.mood_score || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Smart Help Routing Section (Accent Green border) */}
        <div className="border-l-4 border-[#00d722] bg-[#f9fff9] rounded-r-[8px] p-6 mt-8">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#00d722] uppercase block mb-1">Akses Bantuan Terdekat</span>
          <h4 className="text-lg font-medium text-[#080808] mb-2">Konseling & Bantuan Profesional Terdekat</h4>
          <p className="text-xs text-[#5a5a5a] mb-4">
            Menghubungkan Anda langsung ke layanan medis terdekat tanpa resep otomatis AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
              <strong className="text-[#080808] block mb-1">Rumah Sakit Umum Daerah (RSUD)</strong>
              <p className="text-[#898989] mb-2">Poli Jiwa / Psikiatri Terdekat</p>
              <span className="text-[10px] font-mono bg-[#00d722]/10 text-[#00d722] px-1.5 py-0.5 rounded">Rujukan GPS Akurat</span>
            </div>
            <div className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
              <strong className="text-[#080808] block mb-1">Puskesmas Kecamatan</strong>
              <p className="text-[#898989] mb-2">Layanan Psikologi Klinis bersubsidi</p>
              <span className="text-[10px] font-mono bg-[#00d722]/10 text-[#00d722] px-1.5 py-0.5 rounded">Tarif Terjangkau</span>
            </div>
            <div className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
              <strong className="text-[#080808] block mb-1">Yayasan Into The Light</strong>
              <p className="text-[#898989] mb-2">Pendampingan krisis pencegahan bunuh diri</p>
              <a href="https://www.intothelightid.org" target="_blank" rel="noreferrer" className="text-[#3b89ff] hover:underline block font-semibold mt-1">Kunjungi Website</a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d8d8d8] py-8 text-center text-xs text-[#898989] mt-12 bg-[#fafafa]">
        <p>© 2026 InkTrace AI. Designed with Webflow aesthetics for 10th Hackathon Dynan.</p>
      </footer>

      {/* Digital Detox (Jomblo Mode) Fullscreen Overlay */}
      {isDetoxActive && (
        <div className="fixed inset-0 z-50 bg-[#080808]/95 flex flex-col items-center justify-center p-8 text-white select-none">
          <div className="max-w-xl w-full text-center space-y-6">
            <span className="text-xs font-mono tracking-widest text-[#ff6b00] uppercase block">Digital Detox Mode</span>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Jomblo Mode Aktif</h2>
            <p className="text-sm text-[#ababab]">
              Semua distrasi ditutup. Luangkan waktu sejenak untuk menulis secara penuh.
            </p>
            <div className="text-4xl font-mono font-semibold tracking-wider text-[#ff6b00] py-2">
              {Math.floor(detoxTimer / 60)}:{String(detoxTimer % 60).padStart(2, '0')}
            </div>

            <div className="border border-[#7a3dff] rounded-[8px] overflow-hidden bg-white p-4 w-full h-[280px]">
              <JournalCanvas
                ref={canvasRef}
                onStrokeChange={handleStrokeChange}
                onEraseCountChange={handleEraseCountChange}
              />
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setIsDetoxActive(false)}
                className="bg-white hover:bg-[#fafafa] text-[#080808] font-medium text-sm py-2 px-6 rounded-[4px] transition-all cursor-pointer"
              >
                Selesai & Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crisis Alert Modal (Pencegahan Risiko) */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 bg-[#ee1d36] text-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="max-w-lg space-y-6">
            <div className="w-16 h-16 rounded-full bg-white text-[#ee1d36] flex items-center justify-center mx-auto text-3xl font-bold">
              ⚠
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Crisis Helpline Alert</h2>
            <p className="text-base text-[#ffeaeb] leading-relaxed">
              Halo, sistem mendeteksi indikasi stres ekstrem atau kecenderungan melukai diri sendiri dari tulisan Anda. Anda tidak sendirian. Silakan hubungi bantuan ahli atau hubungi kontak terdekat Anda segera.
            </p>

            <div className="bg-white/10 border border-white/20 p-4 rounded-[8px] space-y-2 text-sm text-left">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <strong>Into The Light:</strong>
                <span>intothelightid.org</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <strong>Hotline Kemenkes:</strong>
                <span>119 ext. 8</span>
              </div>
              <div className="flex justify-between">
                <strong>Yayasan Pulih (Konseling):</strong>
                <span>pulihfoundation.org</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setShowCrisisModal(false)}
                className="bg-white text-[#ee1d36] hover:bg-white/95 font-medium text-sm py-2.5 px-6 rounded-[4px] transition-all cursor-pointer"
              >
                Saya Mengerti & Aman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
