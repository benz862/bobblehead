"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SPORT_TEAMS, SPORT_ORIENTATIONS, SPORT_POSITIONS, SOCCER_LEAGUES, type Team } from "@/lib/teams";
import { Upload, X, ChevronRight, Loader2, Camera, Palette, Trophy, ShoppingCart, Gift } from "lucide-react";

const STEPS = [
  { label: "Upload", icon: Camera, emoji: "📸" },
  { label: "Style", icon: Palette, emoji: "🎭" },
  { label: "Nameplate", icon: Trophy, emoji: "🏆" },
  { label: "Checkout", icon: ShoppingCart, emoji: "🛒" },
];

export function BuilderForm() {
  const searchParams = useSearchParams();
  const tierParam = parseInt(searchParams.get('tier') || '1');
  const tier = [1, 3, 5].includes(tierParam) ? tierParam : 1;
  const price = tier === 1 ? 799 : tier === 3 ? 1999 : 2799;
  const tierLabel = tier === 1 ? 'Starter' : tier === 3 ? 'Fan Favorite' : 'Super Pack';
  const tierEmoji = tier === 1 ? '🗿' : tier === 3 ? '🏆' : '🎉';
  const [themeType, setThemeType] = useState<"sport" | "occupation" | "pet" | null>(null);
  const [nameplate, setNameplate] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Credit reuse: when returning with an existing order_id
  const existingOrderId = searchParams.get('order_id');
  const [creditInfo, setCreditInfo] = useState<{ total: number; used: number } | null>(null);
  const [existingUploads, setExistingUploads] = useState<string[]>([]);

  useEffect(() => {
    if (!existingOrderId) return;
    (async () => {
      const { data: order } = await supabase.from('orders').select('credits_total, credits_used, tier').eq('id', existingOrderId).single();
      if (order) {
        setCreditInfo({ total: order.credits_total, used: order.credits_used });
      }
      const { data: uploads } = await supabase.from('uploads').select('image_url').eq('order_id', existingOrderId);
      if (uploads && uploads.length > 0) {
        setExistingUploads(uploads.map((u: any) => u.image_url));
      }
    })();
  }, [existingOrderId]);
  
  // Sport state
  const [sport, setSport] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCustomTeam, setIsCustomTeam] = useState(false);
  const [customTeamName, setCustomTeamName] = useState("");
  const [teamColors, setTeamColors] = useState("");
  const [jersey, setJersey] = useState("");
  const [position, setPosition] = useState("");
  const [orientations, setOrientations] = useState<Record<string, string>>({});
  const [soccerLeague, setSoccerLeague] = useState("");
  const [sportCustomDetails, setSportCustomDetails] = useState("");
  
  // Occupation state
  const [occupation, setOccupation] = useState("");
  const [customOccupation, setCustomOccupation] = useState("");
  const [customProps, setCustomProps] = useState("");

  // Pet state
  const [animalType, setAnimalType] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petCostume, setPetCostume] = useState("");

  // Promo state — read from URL if the user clicked the email link
  const promoParam = searchParams.get('promo') || '';
  const [promoCode, setPromoCode] = useState(promoParam);
  const [showPromo, setShowPromo] = useState(!!promoParam);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Calculate current step for the progress indicator
  const getCurrentStep = () => {
    if (images.length === 0) return 0;
    if (!themeType) return 1;
    if (themeType === "sport" && !sport) return 1;
    if (themeType === "occupation" && !occupation) return 1;
    if (themeType === "pet" && !animalType) return 1;
    return 2;
  };
  const currentStep = getCurrentStep();

  // Dynamic team list based on selected sport
  const teams = sport === 'soccer' 
    ? (SOCCER_LEAGUES.find(l => l.name === soccerLeague)?.teams || []) 
    : (sport ? SPORT_TEAMS[sport] || [] : []);
  const positions = sport ? SPORT_POSITIONS[sport] || [] : [];
  const orientationFields = sport ? SPORT_ORIENTATIONS[sport] || [] : [];

  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    setSelectedTeam(null);
    setIsCustomTeam(false);
    setTeamColors("");
    setPosition("");
    setOrientations({});
    setSoccerLeague("");
    setSportCustomDetails("");
  };

  const handleTeamSelect = (teamName: string) => {
    if (teamName === "__custom__") {
      setIsCustomTeam(true);
      setSelectedTeam(null);
      setTeamColors("");
    } else {
      setIsCustomTeam(false);
      const team = teams.find(t => t.name === teamName) || null;
      setSelectedTeam(team);
      if (team) {
        setTeamColors(`${team.primaryColor} and ${team.secondaryColor}${team.accentColor ? ` with ${team.accentColor} accents` : ''}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // If returning to use a credit, reuse the existing order
      if (existingOrderId && creditInfo && creditInfo.used < creditInfo.total) {
        const orderId = existingOrderId;

        // Upload photos if user provided new ones; otherwise reuse existing
        let uploadedUrls = existingUploads;
        if (images.length > 0) {
          uploadedUrls = [];
          for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${orderId}-credit${creditInfo.used + 1}-${i}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('user-uploads').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage.from('user-uploads').getPublicUrl(fileName);
            uploadedUrls.push(publicUrlData.publicUrl);
          }
          // Insert new upload records
          const uploadInserts = uploadedUrls.map(url => ({ order_id: parseInt(orderId), image_url: url }));
          await supabase.from('uploads').insert(uploadInserts);
        }

        const finalOccupation = occupation === 'custom' ? customOccupation : occupation;
        const finalTeamName = isCustomTeam ? customTeamName : (selectedTeam?.name || '');
        const themeDetails = {
          sport, teamName: finalTeamName, teamColors, jersey, position, orientations, sportCustomDetails,
          occupation: finalOccupation, customProps,
          animalType: animalType === 'custom' ? petBreed : animalType, petBreed, petCostume,
        };

        // Create a new generation row for this credit use
        await supabase.from('generations').insert([{
          order_id: parseInt(orderId),
          theme_type: themeType,
          theme_details: themeDetails,
          nameplate: nameplate,
          status: 'pending'
        }]);

        // Skip payment — go straight to success
        window.location.href = `/success?session_id=credit_reuse&order_id=${orderId}`;
        return;
      }
      
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{ tier, amount: price, status: 'pending', credits_total: tier, credits_used: 0 }])
        .select()
        .single();
        
      if (error) throw error;

      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${order.id}-${i}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const uploadInserts = uploadedUrls.map(url => ({
        order_id: order.id,
        image_url: url
      }));
      await supabase.from('uploads').insert(uploadInserts);

      const finalOccupation = occupation === 'custom' ? customOccupation : occupation;
      const finalTeamName = isCustomTeam ? customTeamName : (selectedTeam?.name || '');

      const themeDetails = {
        sport,
        teamName: finalTeamName,
        teamColors,
        jersey,
        position,
        orientations,
        sportCustomDetails,
        occupation: finalOccupation,
        customProps,
        animalType: animalType === 'custom' ? petBreed : animalType,
        petBreed,
        petCostume,
      };
      
      await supabase.from('generations').insert([{
        order_id: order.id,
        theme_type: themeType,
        theme_details: themeDetails,
        nameplate: nameplate,
        status: 'pending'
      }]);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: order.id, 
          tier,
          promoCode: promoCode || undefined,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200";
  const selectClass = inputClass;

  return (
    <div className="p-6 pb-12 space-y-8 relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="relative h-20 w-20 mx-auto">
              <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary/30" strokeWidth={1} />
              <div className="absolute inset-2 bg-gradient-to-tr from-primary/20 to-primary/60 rounded-full animate-pulse blur-sm" />
              <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center text-2xl">🗿</div>
            </div>
            <h2 className="text-xl font-bold">Creating Magic...</h2>
            <p className="text-sm text-muted-foreground">Setting up your bobblehead order ✨</p>
          </div>
        </div>
      )}

      {/* Header + Tier Badge */}
      <div>
        <h2 className="text-2xl font-bold mb-1">🎨 Build Your Bobblehead</h2>
        <p className="text-sm text-muted-foreground">Pick your look, upload your face, and let the magic happen!</p>
        {existingOrderId && creditInfo ? (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-800 font-bold text-sm px-4 py-2 rounded-full">
            <span>🎯</span>
            <span>Credit {creditInfo.used + 1} of {creditInfo.total}</span>
            <span className="text-green-500">|</span>
            <span className="text-green-600">{creditInfo.total - creditInfo.used} remaining — FREE</span>
          </div>
        ) : (
          <div className="mt-3 inline-flex items-center gap-2 bg-purple-100 text-purple-800 font-bold text-sm px-4 py-2 rounded-full">
            <span>{tierEmoji}</span>
            <span>{tierLabel} — {tier} {tier === 1 ? 'bobblehead' : 'bobbleheads'}</span>
            <span className="text-purple-500">|</span>
            <span>${(price / 100).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between px-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < currentStep
                  ? "bg-green-500 text-white scale-100"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? "✓" : step.emoji}
              </div>
              <span className={`text-xs font-medium mt-1.5 transition-colors ${
                i <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5">
                <div className={`h-0.5 rounded-full transition-all duration-500 ${
                  i < currentStep ? "bg-green-500" : "bg-muted"
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-lg">😵</span>
          <p className="flex-1 text-destructive font-medium">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-destructive/60 hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 1: Photos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-primary/80">📸 1. Upload Your Photo</h3>
        <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 hover:border-primary/40 transition-all duration-200 cursor-pointer relative group">
          <input 
            type="file" multiple accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => { if (e.target.files) setImages(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5)); }}
          />
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">Click or drag to upload 1-5 photos</p>
          <p className="text-xs text-muted-foreground mt-1">Clear, front-facing faces work best</p>
        </label>
        {images.length > 0 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <p className="text-sm font-medium text-green-600">✅ {images.length} photo{images.length !== 1 ? 's' : ''} selected</p>
            <div className="flex gap-2 flex-wrap">
              {images.map((f, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted group/thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 h-5 w-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Theme */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-primary/80">🎭 2. Pick Your Style</h3>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => { setThemeType("sport"); setOccupation(""); setCustomOccupation(""); setAnimalType(""); }}
            className={`flex flex-col items-center justify-center border rounded-md p-4 transition-all duration-200 ${themeType === "sport" ? "border-primary bg-primary/5 ring-2 ring-primary shadow-lg shadow-primary/10" : "bg-background hover:border-primary/50 hover:shadow-md"}`}
          >
            <span className="text-2xl mb-1">⚽</span>
            <span className="font-medium text-sm">Sports</span>
            <span className="text-xs text-muted-foreground mt-1">Teams & Athletes</span>
          </button>
          <button 
            onClick={() => { setThemeType("occupation"); setSport(""); setSelectedTeam(null); setAnimalType(""); }}
            className={`flex flex-col items-center justify-center border rounded-md p-4 transition-all duration-200 ${themeType === "occupation" ? "border-primary bg-primary/5 ring-2 ring-primary shadow-lg shadow-primary/10" : "bg-background hover:border-primary/50 hover:shadow-md"}`}
          >
            <span className="text-2xl mb-1">👔</span>
            <span className="font-medium text-sm">Occupation</span>
            <span className="text-xs text-muted-foreground mt-1">Jobs & Custom</span>
          </button>
          <button 
            onClick={() => { setThemeType("pet"); setSport(""); setSelectedTeam(null); setOccupation(""); setCustomOccupation(""); }}
            className={`flex flex-col items-center justify-center border rounded-md p-4 transition-all duration-200 ${themeType === "pet" ? "border-primary bg-primary/5 ring-2 ring-primary shadow-lg shadow-primary/10" : "bg-background hover:border-primary/50 hover:shadow-md"}`}
          >
            <span className="text-2xl mb-1">🐾</span>
            <span className="font-medium text-sm">Pet</span>
            <span className="text-xs text-muted-foreground mt-1">Dogs, Cats & More</span>
          </button>
        </div>
      </div>

      {/* === SPORT OPTIONS === */}
      {themeType === "sport" && (
        <div className="p-4 border rounded-md bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Sport</label>
            <select value={sport} onChange={(e) => handleSportChange(e.target.value)} className={selectClass}>
              <option value="">Choose a sport...</option>
              <option value="hockey">Ice Hockey</option>
              <option value="baseball">Baseball</option>
              <option value="football">Football</option>
              <option value="soccer">Soccer</option>
              <option value="golf">Golf</option>
              <option value="boxing">Boxing</option>
            </select>
          </div>

          {/* Soccer League Selection */}
          {sport === 'soccer' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-sm font-medium">Select League</label>
              <select value={soccerLeague} onChange={(e) => { setSoccerLeague(e.target.value); setSelectedTeam(null); setIsCustomTeam(false); setTeamColors(''); }} className={selectClass}>
                <option value="">Choose a league...</option>
                {SOCCER_LEAGUES.map(l => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Team Selection */}
          {sport && teams.length > 0 && (sport !== 'soccer' || soccerLeague) && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-sm font-medium">Select Team</label>
              <select 
                value={isCustomTeam ? "__custom__" : (selectedTeam?.name || "")} 
                onChange={(e) => handleTeamSelect(e.target.value)} 
                className={selectClass}
              >
                <option value="">Choose a team...</option>
                {teams.map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
                <option value="__custom__">✏️ Custom Team</option>
              </select>
            </div>
          )}

          {/* Custom Team Fields */}
          {isCustomTeam && (
            <div className="space-y-3 p-3 border rounded-md bg-background animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Team Name</label>
                <input type="text" value={customTeamName} onChange={(e) => setCustomTeamName(e.target.value)} placeholder="e.g. The Thunder Bears" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Colors</label>
                <input type="text" value={teamColors} onChange={(e) => setTeamColors(e.target.value)} placeholder="e.g. Red and Gold" className={inputClass} />
              </div>
            </div>
          )}

          {/* Auto-filled team colors display */}
          {selectedTeam && !isCustomTeam && (
            <div className="text-xs text-muted-foreground p-2 bg-primary/5 rounded-md flex items-center gap-2">
              <span>🎨</span>
              Team Colors: <span className="font-medium">{teamColors}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jersey #</label>
              <input type="text" value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="e.g. 99" className={inputClass} />
            </div>
            {positions.length > 0 && positions[0] !== "" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value)} className={selectClass}>
                  <option value="">Select position...</option>
                  {positions.map(p => (<option key={p} value={p.toLowerCase()}>{p}</option>))}
                </select>
              </div>
            )}
          </div>

          {/* Sport-Specific Orientation */}
          {orientationFields.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {orientationFields.map(field => {
                if (field.condition) {
                  const currentVal = field.condition.field === "position" ? position : "";
                  if (currentVal !== field.condition.value) return null;
                }
                return (
                  <div key={field.label} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <select 
                      value={orientations[field.label] || ""} 
                      onChange={(e) => setOrientations(prev => ({ ...prev, [field.label]: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {field.options.map(o => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Details */}
          {sport && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-sm font-medium">Custom Details (Optional)</label>
              <textarea 
                value={sportCustomDetails} 
                onChange={(e) => setSportCustomDetails(e.target.value)} 
                placeholder={`e.g. Pink polo shirt, khaki shorts, orange shoes, tartan patterned base, aviator sunglasses, specific glove color...`}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 min-h-[80px] resize-y"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Add any custom clothing, accessories, colors, or base design details. The AI will incorporate these into your bobblehead.</p>
            </div>
          )}
        </div>
      )}

      {/* === OCCUPATION OPTIONS === */}
      {themeType === "occupation" && (
        <div className="p-4 border rounded-md bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Occupation</label>
            <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className={selectClass}>
              <option value="">Choose an occupation...</option>
              <option value="doctor">Doctor / Surgeon</option>
              <option value="firefighter">Firefighter</option>
              <option value="police">Police Officer</option>
              <option value="teacher">Teacher</option>
              <option value="chef">Chef</option>
              <option value="nurse">Nurse</option>
              <option value="military">Military / Soldier</option>
              <option value="construction">Construction Worker</option>
              <option value="scientist">Scientist</option>
              <option value="astronaut">Astronaut</option>
              <option value="pilot">Pilot</option>
              <option value="business">Business Professional</option>
              <option value="custom">✏️ Custom (Type below)</option>
            </select>
          </div>
          {occupation === "custom" && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-sm font-medium">Describe Your Character</label>
              <input 
                type="text" 
                value={customOccupation} 
                onChange={(e) => setCustomOccupation(e.target.value)} 
                placeholder="e.g. Disco Dancer, Hippie listening to music, Pirate Captain" 
                className={inputClass} 
              />
              <p className="text-xs text-muted-foreground">Be as descriptive as you like! The AI will match the outfit and props to your description.</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Extra Props / Details (Optional)</label>
            <input type="text" value={customProps} onChange={(e) => setCustomProps(e.target.value)} placeholder="e.g. Holding a wrench, wearing blue overalls" className={inputClass} />
          </div>
        </div>
      )}

      {/* === PET OPTIONS === */}
      {themeType === "pet" && (
        <div className="p-4 border rounded-md bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type of Animal</label>
            <select value={animalType} onChange={(e) => { setAnimalType(e.target.value); setPetBreed(""); }} className={selectClass}>
              <option value="">Choose an animal...</option>
              <option value="dog">🐕 Dog</option>
              <option value="cat">🐈 Cat</option>
              <option value="bird">🦜 Bird</option>
              <option value="rabbit">🐇 Rabbit</option>
              <option value="hamster">🐹 Hamster / Guinea Pig</option>
              <option value="fish">🐠 Fish</option>
              <option value="reptile">🦎 Reptile</option>
              <option value="horse">🐴 Horse</option>
              <option value="custom">✏️ Other (Type below)</option>
            </select>
          </div>
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="text-sm font-medium">{animalType === 'custom' ? 'Describe Your Pet' : 'Breed (Optional)'}</label>
            <input 
              type="text" 
              value={petBreed} 
              onChange={(e) => setPetBreed(e.target.value)} 
              placeholder={animalType === 'custom' ? 'e.g. Bearded Dragon, Ferret, Hedgehog' : animalType === 'dog' ? 'e.g. Golden Retriever, Pug, Husky' : animalType === 'cat' ? 'e.g. Persian, Siamese, Maine Coon' : 'e.g. Specific breed or type'}
              className={inputClass} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Costume / Accessory (Optional)</label>
            <input 
              type="text" 
              value={petCostume} 
              onChange={(e) => setPetCostume(e.target.value)} 
              placeholder="e.g. Superhero cape, Tuxedo, Crown, Sunglasses" 
              className={inputClass} 
            />
            <p className="text-xs text-muted-foreground">Give your pet a fun outfit! Leave blank for a natural look.</p>
          </div>
        </div>
      )}

      {/* Step 3: Nameplate */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-primary/80">🏆 3. Nameplate</h3>
        <div className="space-y-2">
          <input 
            type="text" placeholder="e.g. GLENN #27" value={nameplate}
            onChange={(e) => setNameplate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
            maxLength={24}
          />
          <p className="text-xs text-muted-foreground text-right">{nameplate.length} / 24 characters</p>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="pt-4 border-t mt-8">
        <button
          type="button"
          onClick={() => setShowPromo(!showPromo)}
          className="text-sm text-primary font-medium flex items-center gap-1.5 hover:underline mb-3"
        >
          <Gift className="h-4 w-4" />
          {showPromo ? 'Hide promo code' : 'Have a promo code?'}
        </button>

        {showPromo && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 space-y-3 mb-4">
            <p className="text-sm font-medium">🎁 Enter your promo code</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); }}
                placeholder="BOBBLE-XXXXXX"
                className={inputClass + " flex-1 font-mono tracking-wider"}
              />
              {promoCode && (
                <span className="flex items-center text-xs text-green-600 font-medium px-3">✅ Applied</span>
              )}
            </div>
            {promoError && <p className="text-xs text-destructive">{promoError}</p>}
            {!promoCode && <p className="text-xs text-muted-foreground">Don&apos;t have a code? <a href="/pricing" className="text-primary hover:underline">Get one free on our pricing page!</a></p>}
          </div>
        )}

        {/* Checkout */}
        <button 
          onClick={handleCheckout}
          disabled={(images.length === 0 && existingUploads.length === 0) || !themeType || isProcessing}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 hover:shadow-xl hover:scale-[1.02] h-14 px-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Magic...
            </>
          ) : existingOrderId && creditInfo ? (
            <>
              <Gift className="h-4 w-4" />
              ✨ Generate — Free!
            </>
          ) : promoCode ? (
            <>
              <Gift className="h-4 w-4" />
              🎉 Create My FREE Bobblehead!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Proceed to Checkout (${(price / 100).toFixed(2)})
            </>
          )}
        </button>
        {images.length === 0 && existingUploads.length === 0 && (
          <p className="text-xs text-destructive mt-2 text-center">Please upload at least 1 photo to continue.</p>
        )}
      </div>
    </div>
  );
}
