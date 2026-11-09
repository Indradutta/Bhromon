import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * BHROMON Preloader (UI/UX Designer Refined Edition)
 * 
 * Features:
 * - Solid Red Sun visual anchor in the sky, aligned behind the bridge, the train, and the letters.
 * - Perfectly proportioned sun diameter completely framing the BHROMON brand lockup.
 * - Sited in the lower third (74% height on mobile) with elegant architectural viaduct piers.
 * - 100% opaque solid background (#F4F1E8) with zero leaks or gaps.
 * - Dynamic ResizeObserver coordinate mapping.
 * - Organic trailing curved wipe transition into the website hero.
 */
export default function BhromonPreloader({ onComplete }) {
  const containerRef = useRef(null);
  const trainGroupRef = useRef(null);
  const wheelsRef = useRef([]);
  const coachesRef = useRef([]);
  const lettersRef = useRef([]);
  const subtitleRef = useRef(null);
  const sunRef = useRef(null);
  const wipeCurveRef = useRef(null);

  // Exact physical dimensions of the container viewport
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Helpers to collect refs
  const addWheelRef = (el) => {
    if (el && !wheelsRef.current.includes(el)) {
      wheelsRef.current.push(el);
    }
  };

  const addCoachRef = (el) => {
    if (el && !coachesRef.current.includes(el)) {
      coachesRef.current.push(el);
    }
  };

  // Dynamically track container dimensions using ResizeObserver
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.round(rect.width || window.innerWidth);
        const h = Math.round(rect.height || window.innerHeight);
        setDimensions({ width: w, height: h });
      } else {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    updateDimensions();

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    let ro;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateDimensions();
      });
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      if (ro) ro.disconnect();
    };
  }, []);

  const { width, height } = dimensions;
  const isMobile = width < 768;

  // Bridge vertical position:
  // Placed in the lower third (74% on mobile, 72% on desktop)
  // Gives generous, peaceful editorial sky and perfectly anchors the sun
  const bridgeY = Math.round(height * (isMobile ? 0.74 : 0.72));

  // Scale factor for train components based on screen size
  const scale = isMobile ? Math.max(0.52, width / 720) : Math.min(1.0, width / 1400);

  // Train dimensions scaled
  const wheelR = 9.5 * scale;
  const locoWidth = 185 * scale;
  const coachWidth = 155 * scale;
  const couplerWidth = 11 * scale;
  const coachHeight = 35 * scale;
  const totalTrainWidth = locoWidth + couplerWidth + (coachWidth * 3) + (couplerWidth * 2);

  // Train travel coordinates
  const startX = -totalTrainWidth - 40;
  const endX = width + 40;

  // Red Sun geometry:
  // Perfectly proportioned: diameter ~66% of mobile screen width (~560px on desktop)
  // Comfortably frames the entire BHROMON wordmark with elegant optical padding
  const centerX = width / 2;
  const sunR = isMobile 
    ? Math.round(width * 0.33) 
    : Math.max(255, Math.round(height * 0.29));
  const sunCenterY = bridgeY - (isMobile ? 54 : 76);

  // Master GSAP Timeline
  useEffect(() => {
    wheelsRef.current = [];
    coachesRef.current = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      // Initial positions:
      gsap.set(trainGroupRef.current, { x: startX, y: 0 });
      gsap.set(lettersRef.current, { y: 140 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 15 });
      gsap.set(sunRef.current, { opacity: 0, scale: 0.94 });

      // PHASE 01: Establish the scene (0.3s) - Sun emerges softly with the scene
      tl.to(sunRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "power2.out"
      }, 0);

      tl.to({}, { duration: 0.3 });

      // PHASE 02 & 03 & 04: Train enters and crosses the screen as the loader
      // The black train silhouette travels right across the glowing crimson sun!
      tl.to(trainGroupRef.current, {
        x: endX,
        duration: 4.2,
        ease: "power1.inOut",
        onUpdate: function () {
          const prog = Math.round(this.progress() * 100);
          setLoadingProgress(prog);
        }
      }, "trainTravel");

      // Mechanical Wheel Rotation
      const totalDist = endX - startX;
      const circumference = 2 * Math.PI * (wheelR || 8);
      const rotations = Math.round((totalDist / circumference) * 360);

      tl.to(wheelsRef.current, {
        rotation: `+=${rotations}`,
        transformOrigin: "center center",
        duration: 4.2,
        ease: "power1.inOut"
      }, "trainTravel");

      // Subtle Carriage Suspension & Natural Micro-Bounce
      coachesRef.current.forEach((coach, index) => {
        gsap.to(coach, {
          y: (index % 2 === 0 ? -1.2 : 1.0) * scale,
          duration: 0.17 + (index * 0.03),
          repeat: 23,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // PHASE 05: Hold empty bridge for 0.25s (250ms quiet visual breath)
      tl.to({}, { duration: 0.25 });

      // PHASE 06: BHROMON Letters Emerge from underneath the bridge
      // Letters physically rise upward from underneath the bridge deck (Y = bridgeY).
      // They emerge and settle perfectly framed within the crimson circle of the sun!
      const letterConfigs = [
        { delay: 0.00, duration: 0.55 },
        { delay: 0.10, duration: 0.50 },
        { delay: 0.20, duration: 0.55 },
        { delay: 0.30, duration: 0.48 },
        { delay: 0.40, duration: 0.60 },
        { delay: 0.50, duration: 0.50 },
        { delay: 0.60, duration: 0.55 }
      ];

      letterConfigs.forEach((cfg, i) => {
        const letterEl = lettersRef.current[i];
        if (!letterEl) return;
        tl.to(letterEl, {
          y: 0,
          duration: cfg.duration,
          ease: "power4.out" // Fast emergence with gentle deceleration & settle
        }, `letterStart+=${cfg.delay}`);
      });

      // PHASE 07: Final Brand Frame Lockup
      // Subtle secondary subtitle emerges: "TRAVEL • DISCOVER • EXPERIENCE"
      tl.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out"
      }, "+=0.1");

      // Hold final brand frame for 0.70 seconds as specified
      tl.to({}, { duration: 0.70 });

      // PHASE 08: Website Transition - Large elegant curved mask / organic wipe
      // The solid preloader container sweeps upward off the screen with trailing organic arch
      const wipeState = { curveHeight: 0 };

      tl.to(wipeState, {
        curveHeight: 180,
        duration: 0.55,
        ease: "power2.in",
        onUpdate: () => {
          if (wipeCurveRef.current) {
            wipeCurveRef.current.setAttribute(
              'd',
              `M 0 0 Q 500 ${wipeState.curveHeight} 1000 0 L 1000 0 L 0 0 Z`
            );
          }
        }
      }, "wipeTransition");

      // Slide container completely off-screen and fade out
      tl.to(containerRef.current, {
        y: -(height + (height * 0.5)),
        opacity: 0,
        duration: 0.95,
        ease: "power3.inOut",
        onComplete: () => {
          if (onComplete) onComplete();
        }
      }, "wipeTransition");

      tl.to(wipeState, {
        curveHeight: 0,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          if (wipeCurveRef.current) {
            wipeCurveRef.current.setAttribute(
              'd',
              `M 0 0 Q 500 ${wipeState.curveHeight} 1000 0 L 1000 0 L 0 0 Z`
            );
          }
        }
      }, "wipeTransition+=0.55");

    }, containerRef);

    return () => ctx.revert();
  }, [width, height, startX, endX, scale, wheelR, onComplete]);

  // Typography layout calculations:
  // Center is width / 2
  // Sized so that all 7 letters fit completely within the red sun circle
  const letterFontSize = isMobile 
    ? Math.max(30, Math.min(42, Math.round(width * 0.088))) 
    : Math.max(62, Math.min(92, Math.round(width * 0.054)));

  const letterSpacing = isMobile
    ? Math.max(26, Math.min(36, Math.round(width * 0.080)))
    : Math.max(66, Math.min(94, Math.round(width * 0.053)));

  const subtitleFontSize = isMobile ? 8.5 : 11.5;

  const letters = [
    { char: 'B', x: centerX - (letterSpacing * 3) },
    { char: 'H', x: centerX - (letterSpacing * 2) },
    { char: 'R', x: centerX - (letterSpacing * 1) },
    { char: 'O', x: centerX },
    { char: 'M', x: centerX + (letterSpacing * 1) },
    { char: 'O', x: centerX + (letterSpacing * 2) },
    { char: 'N', x: centerX + (letterSpacing * 3) }
  ];

  // Number of truss spans and piers across width
  const spanTargetWidth = isMobile ? 65 : 160;
  const spanCount = Math.max(5, Math.round(width / spanTargetWidth));
  const spanWidth = width / spanCount;

  return (
    <div 
      ref={containerRef}
      id="bhromon-preloader"
      className="fixed inset-0 z-50 w-full h-full min-h-[100dvh] bg-[#F4F1E8] select-none overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      {/* Discreet Skip Intro Pill */}
      <button
        type="button"
        onClick={() => onComplete && onComplete()}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 text-[11px] sm:text-xs font-semibold px-3.5 py-1.5 rounded-full bg-black/10 hover:bg-black/20 text-[#111111] transition-all cursor-pointer backdrop-blur-xs tracking-wide"
        aria-label="Skip introduction animation"
      >
        Skip Intro &rarr;
      </button>

      {/* 
        Full-Screen Precision SVG Canvas:
        Exact pixel-for-pixel coordinate system (viewBox: 0 0 width height).
        Completely eliminates gaps, clipping errors, or transparent leaks.
      */}
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="absolute inset-0 w-full h-full block"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Bridge Clipping Mask:
              Clips anything below Y = bridgeY so letters physically emerge from the bridge deck! */}
          <clipPath id="above-bridge-clip">
            <rect x="0" y="0" width={width} height={bridgeY} />
          </clipPath>

          {/* Wheel Graphic Template */}
          <g id="wheel-graphic">
            <circle cx="0" cy="0" r={wheelR} fill="#0D0D0D" stroke="#262626" strokeWidth={1.2 * scale} />
            <circle cx="0" cy="0" r={wheelR * 0.72} fill="none" stroke="#3D3D3D" strokeWidth={0.8 * scale} />
            {/* 6 Radial spokes */}
            <line x1="0" y1={-wheelR * 0.72} x2="0" y2={wheelR * 0.72} stroke="#3D3D3D" strokeWidth={0.9 * scale} />
            <line x1={-wheelR * 0.62} y1={-wheelR * 0.36} x2={wheelR * 0.62} y2={wheelR * 0.36} stroke="#3D3D3D" strokeWidth={0.9 * scale} />
            <line x1={-wheelR * 0.62} y1={wheelR * 0.36} x2={wheelR * 0.62} y2={-wheelR * 0.36} stroke="#3D3D3D" strokeWidth={0.9 * scale} />
            <circle cx="0" cy="0" r={wheelR * 0.25} fill="#525252" />
          </g>
        </defs>

        {/* 100% Solid Warm Ivory Background (#F4F1E8) covering entire SVG */}
        <rect x="0" y="0" width={width} height={height} fill="#F4F1E8" />

        {/* Subtle editorial paper grain lines */}
        {Array.from({ length: Math.ceil(height / 45) }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 45}
            x2={width}
            y2={i * 45}
            stroke="#E8E4DA"
            strokeWidth="0.5"
            strokeDasharray="3 6"
          />
        ))}

        {/* -------------------------------------------------------------
            RED SOLID SUN (THE VISUAL ANCHOR)
            Positioned behind the bridge, behind the train, and behind the text.
            Subtle balanced size: creates warmth, depth, and majestic editorial framing.
        ------------------------------------------------------------- */}
        <circle
          ref={sunRef}
          cx={centerX}
          cy={sunCenterY}
          r={sunR}
          fill="#BE3827"
          style={{ transformOrigin: `${centerX}px ${sunCenterY}px` }}
          className="select-none pointer-events-none"
        />

        {/* -------------------------------------------------------------
            PHASE 05, 06, 07: BHROMON LOGO LETTERS (Clipped above bridge at Y = bridgeY)
            Positioned in front of the sun, rising from the bridge deck
        ------------------------------------------------------------- */}
        <g clipPath="url(#above-bridge-clip)">
          <g id="bhromon-letters-group">
            {letters.map((item, idx) => (
              <text
                key={idx}
                ref={(el) => (lettersRef.current[idx] = el)}
                x={item.x}
                y={bridgeY - (isMobile ? 54 : 76)} /* Positioned proudly across the sun's chest */
                textAnchor="middle"
                className="font-brand font-bold"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                  fontSize: `${letterFontSize}px`,
                  fontWeight: 700,
                  fill: '#111111',
                  letterSpacing: isMobile ? '0.04em' : '0.12em'
                }}
              >
                {item.char}
              </text>
            ))}
          </g>

          {/* Subtitle: TRAVEL • DISCOVER • EXPERIENCE */}
          <g ref={subtitleRef}>
            <text
              x={centerX}
              y={bridgeY - (isMobile ? 22 : 28)}
              textAnchor="middle"
              className="font-sans"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: `${subtitleFontSize}px`,
                fontWeight: 600,
                fill: '#F4F1E8', /* Ivory text for crisp readability against the red sun */
                letterSpacing: isMobile ? '0.22em' : '0.38em'
              }}
            >
              TRAVEL  •  DISCOVER  •  EXPERIENCE
            </text>
            {/* Subtle ivory accent dot */}
            <circle cx={centerX} cy={bridgeY - (isMobile ? 12 : 16)} r={isMobile ? 1.4 : 1.8} fill="#F4F1E8" />
          </g>
        </g>

        {/* -------------------------------------------------------------
            PHASE 02, 03, 04: THE TRAIN SILHOUETTE
            Locomotive + 3 Passenger Coaches traveling Left to Right.
            Travels directly across the lower half of the red sun!
        ------------------------------------------------------------- */}
        <g ref={trainGroupRef} id="master-train">
          {/* COACH 3 (Rear Coach) */}
          <g ref={addCoachRef} id="coach-3" transform={`translate(0, ${bridgeY - coachHeight - (8 * scale)})`}>
            <path
              d={`M ${20 * scale} ${8 * scale} Q ${20 * scale} ${4 * scale} ${25 * scale} ${4 * scale} L ${(coachWidth - 10 * scale)} ${4 * scale} Q ${coachWidth} ${4 * scale} ${coachWidth} ${8 * scale} L ${coachWidth} ${coachHeight} L ${20 * scale} ${coachHeight} Z`}
              fill="#0F0F0F"
            />
            <path d={`M ${22 * scale} ${4 * scale} L ${(coachWidth - 2 * scale)} ${4 * scale}`} stroke="#222" strokeWidth={1.5 * scale} />
            {/* Windows cutouts showing warm ivory through */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const wx = (32 + (i * 20)) * scale;
              return (
                <rect
                  key={i}
                  x={wx}
                  y={10 * scale}
                  width={13 * scale}
                  height={11 * scale}
                  rx={1.5 * scale}
                  fill="#F4F1E8"
                  stroke="#1A1A1A"
                  strokeWidth={1.2 * scale}
                />
              );
            })}
            <rect x={50 * scale} y={coachHeight} width={60 * scale} height={5 * scale} fill="#181818" />
            <g transform={`translate(${45 * scale}, ${coachHeight})`}>
              <rect x={-14 * scale} y={-2 * scale} width={28 * scale} height={3 * scale} fill="#222" />
              <g ref={addWheelRef} transform={`translate(${-9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
            <g transform={`translate(${(coachWidth - 30 * scale)}, ${coachHeight})`}>
              <rect x={-14 * scale} y={-2 * scale} width={28 * scale} height={3 * scale} fill="#222" />
              <g ref={addWheelRef} transform={`translate(${-9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
          </g>

          {/* Coupler 3-2 */}
          <rect x={coachWidth} y={bridgeY - (28 * scale)} width={couplerWidth} height={20 * scale} fill="#1A1A1A" />
          <line x1={coachWidth} y1={bridgeY - (10 * scale)} x2={coachWidth + couplerWidth} y2={bridgeY - (10 * scale)} stroke="#0D0D0D" strokeWidth={3 * scale} />

          {/* COACH 2 (Middle Coach) */}
          <g ref={addCoachRef} id="coach-2" transform={`translate(${coachWidth + couplerWidth}, ${bridgeY - coachHeight - (8 * scale)})`}>
            <path
              d={`M 0 ${8 * scale} Q 0 ${4 * scale} ${5 * scale} ${4 * scale} L ${(coachWidth - 5 * scale)} ${4 * scale} Q ${coachWidth} ${4 * scale} ${coachWidth} ${8 * scale} L ${coachWidth} ${coachHeight} L 0 ${coachHeight} Z`}
              fill="#0F0F0F"
            />
            <path d={`M ${2 * scale} ${4 * scale} L ${(coachWidth - 2 * scale)} ${4 * scale}`} stroke="#222" strokeWidth={1.5 * scale} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const wx = (12 + (i * 20)) * scale;
              return (
                <rect
                  key={i}
                  x={wx}
                  y={10 * scale}
                  width={13 * scale}
                  height={11 * scale}
                  rx={1.5 * scale}
                  fill="#F4F1E8"
                  stroke="#1A1A1A"
                  strokeWidth={1.2 * scale}
                />
              );
            })}
            <rect x={35 * scale} y={coachHeight} width={60 * scale} height={5 * scale} fill="#181818" />
            <g transform={`translate(${30 * scale}, ${coachHeight})`}>
              <rect x={-14 * scale} y={-2 * scale} width={28 * scale} height={3 * scale} fill="#222" />
              <g ref={addWheelRef} transform={`translate(${-9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
            <g transform={`translate(${(coachWidth - 30 * scale)}, ${coachHeight})`}>
              <rect x={-14 * scale} y={-2 * scale} width={28 * scale} height={3 * scale} fill="#222" />
              <g ref={addWheelRef} transform={`translate(${-9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
          </g>

          {/* Coupler 2-1 */}
          <rect x={(coachWidth * 2) + couplerWidth} y={bridgeY - (28 * scale)} width={couplerWidth} height={20 * scale} fill="#1A1A1A" />
          <line x1={(coachWidth * 2) + couplerWidth} y1={bridgeY - (10 * scale)} x2={(coachWidth * 2) + (couplerWidth * 2)} y2={bridgeY - (10 * scale)} stroke="#0D0D0D" strokeWidth={3 * scale} />

          {/* COACH 1 (First Class Heritage Coach) */}
          <g ref={addCoachRef} id="coach-1" transform={`translate(${(coachWidth * 2) + (couplerWidth * 2)}, ${bridgeY - coachHeight - (8 * scale)})`}>
            <path
              d={`M 0 ${8 * scale} Q 0 ${4 * scale} ${5 * scale} ${4 * scale} L ${(coachWidth - 5 * scale)} ${4 * scale} Q ${coachWidth} ${4 * scale} ${coachWidth} ${8 * scale} L ${coachWidth} ${coachHeight} L 0 ${coachHeight} Z`}
              fill="#0F0F0F"
            />
            <path d={`M ${2 * scale} ${4 * scale} L ${(coachWidth - 2 * scale)} ${4 * scale}`} stroke="#222" strokeWidth={1.5 * scale} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const wx = (12 + (i * 20)) * scale;
              return (
                <rect
                  key={i}
                  x={wx}
                  y={10 * scale}
                  width={13 * scale}
                  height={11 * scale}
                  rx={1.5 * scale}
                  fill="#F4F1E8"
                  stroke="#1A1A1A"
                  strokeWidth={1.2 * scale}
                />
              );
            })}
            <rect x={35 * scale} y={coachHeight} width={60 * scale} height={5 * scale} fill="#181818" />
            <g transform={`translate(${30 * scale}, ${coachHeight})`}>
              <rect x={-14 * scale} y={-2 * scale} width={28 * scale} height={3 * scale} fill="#222" />
              <g ref={addWheelRef} transform={`translate(${-9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
            <g transform={`translate(${(coachWidth - 30 * scale)}, ${coachHeight})`}>
              <rect x={-14 * scale} y={-2 * scale} width={28 * scale} height={3 * scale} fill="#222" />
              <g ref={addWheelRef} transform={`translate(${-9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${9 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
          </g>

          {/* Heavy Locomotive Coupler */}
          <rect x={(coachWidth * 3) + (couplerWidth * 2)} y={bridgeY - (28 * scale)} width={couplerWidth} height={20 * scale} fill="#1A1A1A" />
          <line x1={(coachWidth * 3) + (couplerWidth * 2)} y1={bridgeY - (10 * scale)} x2={(coachWidth * 3) + (couplerWidth * 3)} y2={bridgeY - (10 * scale)} stroke="#0D0D0D" strokeWidth={3.5 * scale} />

          {/* LOCOMOTIVE (Aerodynamic Cab) */}
          <g ref={addCoachRef} id="locomotive" transform={`translate(${(coachWidth * 3) + (couplerWidth * 3)}, ${bridgeY - coachHeight - (8 * scale)})`}>
            <path
              d={`M 0 ${8 * scale} 
                 Q 0 0 ${6 * scale} 0 
                 L ${(locoWidth - 45 * scale)} 0 
                 Q ${(locoWidth - 25 * scale)} 0 ${(locoWidth - 12 * scale)} ${12 * scale} 
                 L ${(locoWidth - 4 * scale)} ${24 * scale} 
                 Q ${locoWidth} ${35 * scale} ${locoWidth} ${coachHeight} 
                 L 0 ${coachHeight} Z`}
              fill="#0A0A0A"
            />
            {/* Pantograph */}
            <rect x={25 * scale} y={-2 * scale} width={45 * scale} height={3 * scale} fill="#222" />
            <path d={`M ${38 * scale} ${-2 * scale} L ${48 * scale} ${-10 * scale} L ${58 * scale} ${-2 * scale}`} stroke="#333" strokeWidth={1.8 * scale} fill="none" />
            <line x1={42 * scale} y1={-10 * scale} x2={54 * scale} y2={-10 * scale} stroke="#444" strokeWidth={2 * scale} />

            {/* Slanted windshield */}
            <polygon
              points={`${(locoWidth - 46 * scale)},${6 * scale} ${(locoWidth - 26 * scale)},${6 * scale} ${(locoWidth - 16 * scale)},${19 * scale} ${(locoWidth - 42 * scale)},${19 * scale}`}
              fill="#F4F1E8"
              stroke="#111111"
              strokeWidth={1.2 * scale}
            />
            {/* Crew window */}
            <rect x={(locoWidth - 75 * scale)} y={8 * scale} width={18 * scale} height={12 * scale} rx={1.5 * scale} fill="#F4F1E8" stroke="#111111" strokeWidth={1.2 * scale} />
            {/* Louvers */}
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={(25 + (i * 12)) * scale} y={11 * scale} width={6 * scale} height={11 * scale} fill="#222" rx={0.5 * scale} />
            ))}

            {/* Headlight */}
            <circle cx={locoWidth - (4 * scale)} cy={25 * scale} r={3 * scale} fill="#D97706" />
            <circle cx={locoWidth - (4 * scale)} cy={25 * scale} r={1.5 * scale} fill="#FFFBEB" />

            {/* Cowcatcher */}
            <polygon
              points={`${(locoWidth - 10 * scale)},${coachHeight} ${locoWidth + (6 * scale)},${coachHeight} ${locoWidth + (10 * scale)},${coachHeight + (8 * scale)} ${(locoWidth - 12 * scale)},${coachHeight + (8 * scale)}`}
              fill="#181818"
            />

            {/* Bogies */}
            <g transform={`translate(${40 * scale}, ${coachHeight})`}>
              <rect x={-20 * scale} y={-2 * scale} width={40 * scale} height={3 * scale} fill="#1C1C1C" />
              <g ref={addWheelRef} transform={`translate(${-12 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${12 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
            <g transform={`translate(${(locoWidth - 40 * scale)}, ${coachHeight})`}>
              <rect x={-20 * scale} y={-2 * scale} width={40 * scale} height={3 * scale} fill="#1C1C1C" />
              <g ref={addWheelRef} transform={`translate(${-12 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
              <g ref={addWheelRef} transform={`translate(${12 * scale}, 0)`}>
                <use href="#wheel-graphic" />
              </g>
            </g>
          </g>
        </g>

        {/* -------------------------------------------------------------
            PHASE 01: THE RAILWAY BRIDGE SILHOUETTE
            Extends horizontally edge-to-edge.
            The bridge sits directly in front of the lower portion of the sun.
        ------------------------------------------------------------- */}
        <g id="master-bridge">
          {/* Top Running Steel Rail */}
          <line x1="0" y1={bridgeY} x2={width} y2={bridgeY} stroke="#111111" strokeWidth={isMobile ? 3 : 4} />
          {/* Guard Rail */}
          <line x1="0" y1={bridgeY + 3.5} x2={width} y2={bridgeY + 3.5} stroke="#222222" strokeWidth={isMobile ? 1.5 : 2} />

          {/* Railway Ties / Sleepers */}
          {Array.from({ length: Math.ceil(width / (isMobile ? 10 : 16)) }).map((_, idx) => {
            const step = isMobile ? 10 : 16;
            return (
              <line
                key={idx}
                x1={idx * step + (step / 2)}
                y1={bridgeY + 1}
                x2={idx * step + (step / 2)}
                y2={bridgeY + (isMobile ? 8 : 12)}
                stroke="#111111"
                strokeWidth={isMobile ? 2.2 : 3.5}
              />
            );
          })}

          {/* Continuous Steel Deck Girder Beam */}
          <rect x="0" y={bridgeY + (isMobile ? 8 : 12)} width={width} height={isMobile ? 12 : 18} fill="#111111" />
          <line x1="0" y1={bridgeY + (isMobile ? 20 : 30)} x2={width} y2={bridgeY + (isMobile ? 20 : 30)} stroke="#262626" strokeWidth="2" />

          {/* Girder Rivets */}
          {Array.from({ length: Math.ceil(width / 20) }).map((_, idx) => (
            <circle
              key={idx}
              cx={idx * 20 + 10}
              cy={bridgeY + (isMobile ? 14 : 21)}
              r={1.2}
              fill="#2E2E2E"
            />
          ))}

          {/* Bridge Lattice Cross-Trusses */}
          {Array.from({ length: spanCount }).map((_, spanIdx) => {
            const startX = spanIdx * spanWidth;
            const trussTopY = bridgeY + (isMobile ? 20 : 30);
            const trussHeight = isMobile ? 22 : 38;
            const trussBottomY = trussTopY + trussHeight;
            return (
              <g key={spanIdx} id={`truss-span-${spanIdx}`}>
                {/* Bottom Chord */}
                <line
                  x1={startX}
                  y1={trussBottomY}
                  x2={startX + spanWidth}
                  y2={trussBottomY}
                  stroke="#141414"
                  strokeWidth={isMobile ? 2.5 : 3.5}
                />
                {/* Warren Diagonal Braces */}
                <line x1={startX} y1={trussTopY} x2={startX + (spanWidth * 0.25)} y2={trussBottomY} stroke="#1E1E1E" strokeWidth="1.6" />
                <line x1={startX + (spanWidth * 0.25)} y1={trussBottomY} x2={startX + (spanWidth * 0.5)} y2={trussTopY} stroke="#1E1E1E" strokeWidth="1.6" />
                <line x1={startX + (spanWidth * 0.5)} y1={trussTopY} x2={startX + (spanWidth * 0.75)} y2={trussBottomY} stroke="#1E1E1E" strokeWidth="1.6" />
                <line x1={startX + (spanWidth * 0.75)} y1={trussBottomY} x2={startX + spanWidth} y2={trussTopY} stroke="#1E1E1E" strokeWidth="1.6" />
                {/* Counter-braces */}
                <line x1={startX} y1={trussBottomY} x2={startX + (spanWidth * 0.25)} y2={trussTopY} stroke="#181818" strokeWidth="1.2" />
                <line x1={startX + (spanWidth * 0.25)} y1={trussTopY} x2={startX + (spanWidth * 0.5)} y2={trussBottomY} stroke="#181818" strokeWidth="1.2" />
                <line x1={startX + (spanWidth * 0.5)} y1={trussBottomY} x2={startX + (spanWidth * 0.75)} y2={trussTopY} stroke="#181818" strokeWidth="1.2" />
                <line x1={startX + (spanWidth * 0.75)} y1={trussTopY} x2={startX + spanWidth} y2={trussBottomY} stroke="#181818" strokeWidth="1.2" />
                {/* Vertical struts */}
                <line x1={startX + (spanWidth * 0.25)} y1={trussTopY} x2={startX + (spanWidth * 0.25)} y2={trussBottomY} stroke="#181818" strokeWidth="1.8" />
                <line x1={startX + (spanWidth * 0.5)} y1={trussTopY} x2={startX + (spanWidth * 0.5)} y2={trussBottomY} stroke="#181818" strokeWidth="1.8" />
                <line x1={startX + (spanWidth * 0.75)} y1={trussTopY} x2={startX + (spanWidth * 0.75)} y2={trussBottomY} stroke="#181818" strokeWidth="1.8" />
              </g>
            );
          })}

          {/* Monumental Stone/Steel Piers Grounded to bottom of screen */}
          {Array.from({ length: spanCount + 1 }).map((_, i) => {
            const px = i * spanWidth;
            const pierTopY = bridgeY + (isMobile ? 20 : 30);
            const pierColWidth = isMobile ? 8.5 : 18;
            return (
              <g key={i} transform={`translate(${px}, 0)`}>
                <rect x={-(pierColWidth * 1.3)} y={pierTopY} width={pierColWidth * 2.6} height={isMobile ? 6 : 9} fill="#0A0A0A" />
                <polygon
                  points={`${-pierColWidth},${pierTopY + (isMobile ? 6 : 9)} ${pierColWidth},${pierTopY + (isMobile ? 6 : 9)} ${pierColWidth * 1.2},${height + 10} ${-pierColWidth * 1.2},${height + 10}`}
                  fill="#111111"
                />
                {Array.from({ length: Math.ceil((height - pierTopY) / 55) }).map((_, bi) => {
                  const bandY = pierTopY + 45 + (bi * 55);
                  if (bandY >= height - 5) return null;
                  return (
                    <line
                      key={bi}
                      x1={-(pierColWidth * 1.05)}
                      y1={bandY}
                      x2={pierColWidth * 1.05}
                      y2={bandY}
                      stroke="#1C1C1C"
                      strokeWidth="1.2"
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      {/* 
        Phase 8: Trailing Organic Curved Arch
        Attached directly to the bottom edge of the preloader container.
      */}
      <svg 
        className="absolute left-0 right-0 top-full w-full pointer-events-none" 
        style={{ height: isMobile ? '18vh' : '22vh' }} 
        viewBox="0 0 1000 200" 
        preserveAspectRatio="none"
      >
        <path 
          ref={wipeCurveRef}
          d="M 0 0 Q 500 0 1000 0 L 1000 0 L 0 0 Z" 
          fill="#F4F1E8" 
        />
      </svg>

      {/* Accessible screen reader progress */}
      <span className="sr-only">
        BHROMON Loading: {loadingProgress}% completed
      </span>
    </div>
  );
}
