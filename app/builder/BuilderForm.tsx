"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function BuilderForm() {
  const [themeType, setThemeType] = useState<"sport" | "occupation" | null>(null);
  const [nameplate, setNameplate] = useState("");
  const [images, setImages] = useState<File[]>([]); // We'll handle visual uploads, but logically it's an array
  const [isProcessing, setIsProcessing] = useState(false);

  // Pricing based on tiers
  const tier = images.length <= 1 ? 1 : images.length <= 3 ? 3 : 5;
  const price = tier === 1 ? 799 : tier === 3 ? 1999 : 2799;

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Create order in Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .insert([
          { tier, amount: price, status: 'pending' }
          // user_id is omitted here for simplicity unless Auth is strictly enforced
        ])
        .select()
        .single();
        
      if (error) throw error;

      // 2. Upload images to Supabase Storage Bucket ('user-uploads')
      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${order.id}-${i}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 3. Save uploaded image URLs to 'uploads' table
      const uploadInserts = uploadedUrls.map(url => ({
        order_id: order.id,
        image_url: url
      }));
      await supabase.from('uploads').insert(uploadInserts);

      // 4. Setup generations row with config
      await supabase.from('generations').insert([{
        order_id: order.id,
        theme_type: themeType,
        nameplate: nameplate,
        status: 'pending'
      }]);

      // 5. Init Stripe checkout via our API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: order.id, 
          amount: price, 
          itemDescription: `${tier} Image Custom Bobblehead Generation` 
        })
      });
      const { url, error: stripeError } = await res.json();
      if (stripeError) throw new Error(stripeError);
      
      // 4. Send to Stripe
      window.location.href = url;
      
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please ensure setup is complete.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">Customize Your Bobblehead</h2>
        <p className="text-sm text-muted-foreground">Follow the steps below to configure your perfect custom figure.</p>
      </div>

      {/* Step 1: Photos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-primary/80">1. Upload Photos</h3>
        <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files) {
                // limit to 5
                const selected = Array.from(e.target.files).slice(0, 5);
                setImages(selected);
              }
            }}
          />
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <p className="text-sm font-medium">Click or drag to upload 1-5 photos</p>
          <p className="text-xs text-muted-foreground mt-1">Clear, front-facing faces work best</p>
        </label>
        {images.length > 0 && (
          <div className="text-sm font-medium text-green-600 bg-green-500/10 p-3 rounded-md">
            {images.length} photo(s) selected:
            <ul className="mt-1 space-y-1">
              {images.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground truncate">{f.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Step 2: Theme */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-primary/80">2. Select Theme</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setThemeType("sport")}
            className={`flex flex-col items-center justify-center border rounded-md p-4 transition-all ${themeType === "sport" ? "border-primary bg-primary/5 ring-2 ring-primary" : "bg-background hover:border-primary/50"}`}
          >
            <span className="font-medium">Sports</span>
            <span className="text-xs text-muted-foreground mt-1">Hockey, Baseball, etc.</span>
          </button>
          <button 
            onClick={() => setThemeType("occupation")}
            className={`flex flex-col items-center justify-center border rounded-md p-4 transition-all ${themeType === "occupation" ? "border-primary bg-primary/5 ring-2 ring-primary" : "bg-background hover:border-primary/50"}`}
          >
            <span className="font-medium">Occupation</span>
            <span className="text-xs text-muted-foreground mt-1">Doctor, Firefighter, etc.</span>
          </button>
        </div>
      </div>

      {/* Dynamic Theme Options based on selection */}
      {themeType === "sport" && (
        <div className="p-4 border rounded-md bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Sport</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Choose a sport...</option>
              <option value="hockey">Ice Hockey</option>
              <option value="baseball">Baseball</option>
              <option value="football">Football</option>
              <option value="soccer">Soccer</option>
              <option value="golf">Golf</option>
              <option value="boxing">Boxing</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Colors (Generic)</label>
              <input type="text" placeholder="e.g. Blue & White" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-[outline]:none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jersey #</label>
              <input type="text" placeholder="e.g. 99" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
        </div>
      )}

      {themeType === "occupation" && (
        <div className="p-4 border rounded-md bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Occupation</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Choose an occupation...</option>
              <option value="doctor">Doctor / Surgeon</option>
              <option value="firefighter">Firefighter</option>
              <option value="police">Police Officer</option>
              <option value="teacher">Teacher</option>
              <option value="chef">Chef</option>
              <option value="business">Business Professional</option>
              <option value="custom">Custom (Type below)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Details / Props</label>
            <input type="text" placeholder="e.g. Holding a wrench, wearing blue overalls" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
        </div>
      )}

      {/* Step 3: Nameplate */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-primary/80">3. Engraved Nameplate</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium hidden">Nameplate Text</label>
          <input 
            type="text" 
            placeholder="e.g. GLENN #27" 
            value={nameplate}
            onChange={(e) => setNameplate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground text-right">{nameplate.length} / 20 characters</p>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="pt-4 border-t mt-8">
        <button 
          onClick={handleCheckout}
          disabled={images.length === 0 || !themeType || isProcessing}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
        >
          {isProcessing ? "Processing..." : `Proceed to Checkout ($${(price / 100).toFixed(2)})`}
        </button>
        {images.length === 0 && (
          <p className="text-xs text-destructive mt-2 text-center">Please upload at least 1 photo to continue.</p>
        )}
      </div>
    </div>
  );
}
